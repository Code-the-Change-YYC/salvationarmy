import { z } from "zod";

import { adminProcedure, createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { bookings } from "@/server/db/booking-schema";

export const tripRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        title: z.string(),
        pickupLocation: z.string(),
        dropoffLocation: z.string(),
        purpose: z.string(),
        passengerInfo: z.string(),
        // Requires ISO 8601 String
        scheduledTime: z.string().datetime(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(bookings).values({
        title: input.title,
        pickupLocation: input.pickupLocation,
        dropoffLocation: input.dropoffLocation,
        passengerInfo: input.passengerInfo,
        agencyId: ctx.session.user.id,
        purpose: input.purpose,
        createdBy: ctx.session.user.id,
        scheduledTime: input.scheduledTime,
      });
    }),
});
