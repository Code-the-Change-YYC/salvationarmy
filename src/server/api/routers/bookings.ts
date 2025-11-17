import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { BOOKING_STATUS, bookings } from "../../db/booking-schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

const StatusZ = z.enum(BOOKING_STATUS); // ← uses "cancelled" (double-L)

export const bookingsRouter = createTRPCRouter({
  // POST /bookings (create)
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        pickupLocation: z.string().min(1),
        dropoffLocation: z.string().min(1),
        purpose: z.string().optional(),
        passengerInfo: z.string().min(1),
        agencyId: z.string().min(1),
        driverId: z.string().nullable().optional(),
        status: StatusZ.optional(), // defaults to "incomplete"
        createdBy: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(bookings)
        .values({
          title: input.title,
          pickupLocation: input.pickupLocation,
          dropoffLocation: input.dropoffLocation,
          purpose: input.purpose ?? null,
          passengerInfo: input.passengerInfo,
          agencyId: input.agencyId,
          driverId: input.driverId ?? null,
          status: input.status ?? "incomplete",
          createdBy: input.createdBy ?? null,
          // createdAt/updatedAt use DB defaults
        })
        .returning();

      if (!row) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create booking" });
      }
      return row;
    }),

  // GET /bookings/:id
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const rows = await ctx.db.select().from(bookings).where(eq(bookings.id, input.id)).limit(1);

    const row = rows[0];
    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
    }
    return row; // return single object instead of [row]
  }),

  // GET /bookings
  getAll: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.select().from(bookings).orderBy(desc(bookings.createdAt));
    return rows;
  }),

  // PATCH /bookings/:id
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        pickupLocation: z.string().optional(),
        dropoffLocation: z.string().optional(),
        purpose: z.string().optional(),
        passengerInfo: z.string().optional(),
        driverId: z.string().optional().nullable(),
        status: z.enum(["incomplete", "completed", "in-progress", "cancelled"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // DEV: no auth yet. Re-enable when auth exists:
      // if (!["admin", "dispatcher"].includes(ctx.session.user.role)) {
      //   throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      // }

      const res = await ctx.db.update(bookings).set(updates).where(eq(bookings.id, id));

      return res;
    }),

  // Cancel booking
  cancel: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const res = await ctx.db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.id, input.id));

    return res;
  }),
});
