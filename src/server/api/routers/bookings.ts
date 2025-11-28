import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { BOOKING_STATUS, bookings } from "../../db/booking-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const StatusZ = z.enum(BOOKING_STATUS); // ← uses "cancelled" (double-L)

export const bookingsRouter = createTRPCRouter({
  // POST /bookings (create)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        pickupLocation: z.string().min(1),
        dropoffLocation: z.string().min(1),
        passengerInfo: z.string().min(1),
        agencyId: z.string().min(1),

        // Required because DB has .notNull()
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),

        // Optional fields
        purpose: z.string().optional(),
        driverId: z.string().nullable().optional(),
        status: StatusZ.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Use Drizzle's inferred type so TypeScript validates the shape
      const bookingData: typeof bookings.$inferInsert = {
        title: input.title,
        pickupLocation: input.pickupLocation,
        dropoffLocation: input.dropoffLocation,
        passengerInfo: input.passengerInfo,
        agencyId: input.agencyId,
        startTime: input.startTime,
        endTime: input.endTime,

        createdBy: ctx.session.user.id, // grab from session
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

  // GET /bookings/:id
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const row = await ctx.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, input.id))
      .limit(1)
      .then((r) => r[0]);

    if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });

    return row;
  }),

  // GET /bookings
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.select().from(bookings).orderBy(desc(bookings.createdAt));
    return rows;
  }),

  // PATCH /bookings/:id
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        pickupLocation: z.string().optional(),
        dropoffLocation: z.string().optional(),
        purpose: z.string().optional(),
        passengerInfo: z.string().optional(),
        driverId: z.string().optional().nullable(),
        status: StatusZ.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const res = await ctx.db.update(bookings).set(updates).where(eq(bookings.id, id));

      return res;
    }),

  // PATCH /bookings/:id/cancel
  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, input.id));
    }),
});
