import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gt, lt, ne, or } from "drizzle-orm";
import { z } from "zod";
import { PICKUP_WAIT_TIME_MINUTES, TRAVEL_BUFFER_MINUTES } from "@/constants/driver-assignment";
import { roundUpToNearestIncrement } from "@/lib/datetime";
import { getTravelTimeMinutes } from "@/lib/google-maps";
import { user } from "../../db/auth-schema";
import { BOOKING_STATUS, bookings } from "../../db/booking-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/** Fallback travel minutes per leg when Google Maps API fails */
const FALLBACK_TRAVEL_MINUTES = 15;

const StatusZ = z.enum(BOOKING_STATUS); // ← uses "cancelled" (double-L)

export const bookingsRouter = createTRPCRouter({
  // GET /bookings/drivers (list all drivers)
  listDrivers: protectedProcedure.query(async ({ ctx }) => {
    const drivers = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.role, "driver"))
      .orderBy(asc(user.name));

    return drivers;
  }),

  // GET /bookings/is-driver-available
  isDriverAvailable: protectedProcedure
    .input(
      z.object({
        driverId: z.string().min(1),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        /**
         * Optional booking ID to exclude from the overlap check.
         * Useful when editing an existing booking.
         */
        excludeBookingId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { driverId, startTime, endTime, excludeBookingId } = input;

      // Overlap condition:
      // existing.startTime < endTime AND existing.endTime > startTime
      const baseCondition = and(
        eq(bookings.driverId, driverId),
        ne(bookings.status, "cancelled"),
        lt(bookings.startTime, endTime),
        gt(bookings.endTime, startTime),
      );

      const whereCondition =
        excludeBookingId !== undefined
          ? and(baseCondition, ne(bookings.id, excludeBookingId))
          : baseCondition;

      const overlapping = await ctx.db
        .select({ id: bookings.id })
        .from(bookings)
        .where(whereCondition)
        .limit(1);

      return {
        available: overlapping.length === 0,
      };
    }),

  // GET /bookings/earliest-start-for-driver
  getEarliestStartForDriver: protectedProcedure
    .input(
      z.object({
        driverId: z.string().min(1),
        newPickupAddress: z.string().min(1),
        /** Optional: only consider bookings ending after this time (ISO string) */
        afterDate: z.string().datetime().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { driverId, newPickupAddress, afterDate } = input;

      const driverCondition = and(
        eq(bookings.driverId, driverId),
        ne(bookings.status, "cancelled"),
      );
      const whereCondition =
        afterDate !== undefined
          ? and(driverCondition, gt(bookings.endTime, afterDate))
          : driverCondition;

      const [lastBooking] = await ctx.db
        .select({
          id: bookings.id,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          pickupAddress: bookings.pickupAddress,
          destinationAddress: bookings.destinationAddress,
        })
        .from(bookings)
        .where(whereCondition)
        .orderBy(desc(bookings.endTime))
        .limit(1);

      if (
        !lastBooking?.startTime ||
        !lastBooking?.pickupAddress ||
        !lastBooking?.destinationAddress
      ) {
        return { earliestStart: null };
      }

      const prevStart = new Date(lastBooking.startTime);

      const travel1 =
        (await getTravelTimeMinutes(lastBooking.pickupAddress, lastBooking.destinationAddress)) ??
        FALLBACK_TRAVEL_MINUTES;
      const travel2 =
        (await getTravelTimeMinutes(lastBooking.destinationAddress, newPickupAddress)) ??
        FALLBACK_TRAVEL_MINUTES;

      const earliest = new Date(prevStart.getTime());
      earliest.setMinutes(
        earliest.getMinutes() +
          PICKUP_WAIT_TIME_MINUTES +
          travel1 +
          travel2 +
          TRAVEL_BUFFER_MINUTES,
      );

      const rounded = roundUpToNearestIncrement(earliest);

      return {
        earliestStart: rounded.toISOString(),
      };
    }),

  // POST /bookings (create)
  create: protectedProcedure
    .input(
      z
        .object({
          title: z.string().min(1),
          pickupAddress: z.string().min(1),
          destinationAddress: z.string().min(1),
          passengerInfo: z.string().min(1),
          agencyId: z.string().min(1),

          // Required because DB has .notNull()
          startTime: z.string().datetime(),
          endTime: z.string().datetime(),

          // Optional fields
          purpose: z.string().optional(),
          driverId: z.string().nullable().optional(),
          status: StatusZ.optional(),
        })
        .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
          message: "endTime must be after startTime",
          path: ["endTime"],
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const role = ctx.session.user.role ?? "user";

      // Only allow admins to specify agencyId; non-admins use their own ID
      const agencyId = role === "admin" ? input.agencyId : userId;

      const bookingData: typeof bookings.$inferInsert = {
        title: input.title,
        pickupAddress: input.pickupAddress,
        destinationAddress: input.destinationAddress,
        passengerInfo: input.passengerInfo,
        agencyId,
        startTime: input.startTime,
        endTime: input.endTime,

        createdBy: userId,
      };

      // Only include optional fields if they are actually provided
      if (input.purpose !== undefined) bookingData.purpose = input.purpose;
      if (input.driverId !== undefined) bookingData.driverId = input.driverId;
      if (input.status !== undefined) bookingData.status = input.status;

      const [row] = await ctx.db.insert(bookings).values(bookingData).returning();

      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create booking",
        });
      }
      return row;
    }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const row = await ctx.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, input.id))
      .limit(1)
      .then((r) => r[0]);

    if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });

    const userId = ctx.session.user.id;
    const role = ctx.session.user.role ?? "user"; // default safety

    const allowed = role === "admin" || row.agencyId === userId;

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don’t have permission to view this booking.",
      });
    }

    return row;
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const role = ctx.session.user.role ?? "user";

    if (role === "admin") {
      return ctx.db.select().from(bookings).orderBy(desc(bookings.createdAt));
    }

    return ctx.db
      .select()
      .from(bookings)
      .where(
        or(
          eq(bookings.createdBy, userId),
          eq(bookings.agencyId, userId),
          eq(bookings.driverId, userId),
        ),
      )
      .orderBy(desc(bookings.createdAt));
  }),

  // PATCH /bookings/:id
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        pickupAddress: z.string().optional(),
        destinationAddress: z.string().optional(),
        purpose: z.string().optional(),
        passengerInfo: z.string().optional(),
        driverId: z.string().optional().nullable(),
        status: StatusZ.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // 1) Ensure booking exists
      const existing = await ctx.db
        .select()
        .from(bookings)
        .where(eq(bookings.id, id))
        .limit(1)
        .then((r) => r[0]);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      }

      // 2) Authorization check
      const userId = ctx.session.user.id;
      const role = ctx.session.user.role ?? "user";

      const allowed = role === "admin" || existing.agencyId === userId;

      if (!allowed) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot update this booking." });
      }

      // 3) Filter only defined updates
      const updatesToApply = Object.fromEntries(
        Object.entries(updates).filter(([, v]) => v !== undefined),
      );

      // 4) Perform update with updatedBy field set
      const res = await ctx.db
        .update(bookings)
        .set({
          ...updatesToApply,
          updatedBy: userId,
        })
        .where(eq(bookings.id, id))
        .returning();

      return res[0];
    }),

  // PATCH /bookings/:id/cancel
  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.id))
        .limit(1)
        .then((r) => r[0]);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      }

      const userId = ctx.session.user.id;
      const role = ctx.session.user.role ?? "user";

      const allowed = role === "admin" || existing.agencyId === userId;

      if (!allowed) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot cancel this booking." });
      }

      return ctx.db
        .update(bookings)
        .set({ status: "cancelled", updatedBy: ctx.session.user.id })
        .where(eq(bookings.id, input.id))
        .returning()
        .then((r) => r[0]);
    }),
});
