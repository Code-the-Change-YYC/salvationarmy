import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { bookings } from "@/server/db/booking-schema";

export const tripRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        residentName: z.string().min(1, "Resident name is required"),
        contactInfo: z.string().min(1, "Contact info is required"),
        additionalInfo: z.string().optional(),
        // Requires ISO 8601 String
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        purpose: z.string().min(1, "Purpose is required"),
        pickupAddress: z.string().min(1, "Pickup address is required"),
        destinationAddress: z.string().min(1, "Destination address is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(bookings).values({
        title: input.title,
        pickupAddress: input.pickupAddress,
        destinationAddress: input.destinationAddress,
        passengerInfo: `${input.residentName} ${input.contactInfo} ${input.additionalInfo ? `${input.additionalInfo}` : ""}`,
        agencyId: ctx.session.user.id,
        purpose: input.purpose,
        createdBy: ctx.session.user.id,
        startTime: input.startTime,
        endTime: input.endTime,
      });
    }),
});
