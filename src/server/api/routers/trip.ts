import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { bookings } from "@/server/db/booking-schema";

export const tripRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        title: z.string(),
        residentName: z.string(),
        contactInfo: z.string(),
        additionalInfo: z.string().optional(),
        // Requires ISO 8601 String
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        purpose: z.string(),
        pickupAddress: z.string(),
        destinationAddress: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(bookings).values({
        title: input.title,
        pickupLocation: input.pickupAddress,
        dropoffLocation: input.destinationAddress,
        passengerInfo: `${input.residentName} ${input.contactInfo} ${input.additionalInfo}`,
        agencyId: ctx.session.user.id,
        purpose: input.purpose,
        createdBy: ctx.session.user.id,
        startTime: input.startTime,
        endTime: input.endTime,
      });
    }),
});
