import { eq } from "drizzle-orm";
import { z } from "zod";
import { bookings } from "../../db/booking-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const bookingsRouter = createTRPCRouter({
  // GET /bookings/:id
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    return ctx.db.select().from(bookings).where(eq(bookings.id, input.id)).limit(1);
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
        status: z.enum(["incomplete", "completed", "in-progress", "canceled"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // RBAC Example (adjust if roles differ)
      if (!["admin", "dispatcher"].includes(ctx.session.user.role)) {
        throw new Error("Unauthorized");
      }

      return await ctx.db.update(bookings).set(updates).where(eq(bookings.id, id));
    }),

  // Cancel booking
  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(bookings)
        .set({ status: "incomplete" })
        .where(eq(bookings.id, input.id));
    }),
});
