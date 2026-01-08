import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lt, or } from "drizzle-orm";
import { z } from "zod";
import { isoTimeRegex, isoTimeRegexFourDigitYears } from "@/types/validation";
import { BOOKING_STATUS, bookings } from "../../db/booking-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const StatusZ = z.enum(BOOKING_STATUS); // ← uses "cancelled" (double-L)

export const bookingsRouter = createTRPCRouter({
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

  getAll: protectedProcedure
    .input(
      z
        .object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const role = ctx.session.user.role ?? "user";
      const startDate = input?.startDate ?? "1970-01-01T00:00:00.000-07:00";
      let endDate = input?.endDate ?? "";

      if (input === undefined || input.endDate === undefined) {
        //No end date given, make one
        let largeDate = new Date(new Date().getTime() + 31536000000 * 100).toISOString(); //~100 years after the current date
        largeDate = largeDate.substring(0, largeDate.length - 1); //Remove the UTC timezone to add MST instead
        largeDate = largeDate + "-07:00"; //Add the MST offset
        endDate = largeDate; //Assign it to input.endDate
      }

      let startAndEndDateErrorMessage = "Invalid: ";

      if (!(isoTimeRegex.test(startDate) || isoTimeRegexFourDigitYears.test(startDate))) {
        startAndEndDateErrorMessage = startAndEndDateErrorMessage + "Start Date ";
      }

      if (!(isoTimeRegex.test(endDate) || isoTimeRegexFourDigitYears.test(endDate))) {
        startAndEndDateErrorMessage = startAndEndDateErrorMessage + "End Date ";
      }

      if (startAndEndDateErrorMessage !== "Invalid: ") {
        //Either (or both) dates failed regex check
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: startAndEndDateErrorMessage,
        });
      }

      if (role === "admin") {
        return ctx.db
          .select()
          .from(bookings)
          .where(and(gte(bookings.startTime, startDate), lt(bookings.startTime, endDate)))
          .orderBy(desc(bookings.createdAt));
      }

      return ctx.db
        .select()
        .from(bookings)
        .where(
          and(
            or(
              eq(bookings.createdBy, userId),
              eq(bookings.agencyId, userId),
              eq(bookings.driverId, userId),
            ),
            gte(bookings.startTime, startDate),
            lt(bookings.startTime, endDate),
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
