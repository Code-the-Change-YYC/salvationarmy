import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { bookings } from "../../db/booking-schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const bookingsRouter = createTRPCRouter({
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
