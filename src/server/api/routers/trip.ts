import { eq } from "drizzle-orm";
import { z } from "zod";

import { sendBookingCreatedSms } from "@/lib/sms";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { user } from "@/server/db/auth-schema";
import { bookings } from "@/server/db/booking-schema";

export const tripRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        residentName: z.string().min(1, "Resident name is required"),
        phoneNumber: z.string().min(1, "Phone number is required"),
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
        passengerInfo: `${input.residentName}|${input.phoneNumber}|${input.additionalInfo || ""}`,
        phoneNumber: input.phoneNumber,
        agencyId: ctx.session.user.id,
        purpose: input.purpose,
        createdBy: ctx.session.user.id,
        startTime: input.startTime,
        endTime: input.endTime,
      });

      const drivers = await ctx.db
        .select({ phoneNumber: user.phoneNumber })
        .from(user)
        .where(eq(user.role, "driver"));
      const driverPhones = drivers
        .map((d) => d.phoneNumber)
        .filter((n): n is string => Boolean(n?.trim()));

      void sendBookingCreatedSms(
        {
          title: input.title,
          startTime: input.startTime,
          pickupAddress: input.pickupAddress,
          destinationAddress: input.destinationAddress,
        },
        driverPhones,
      ).catch((err) => {
        console.error("Failed to send booking created SMS:", err);
      });
    }),
});
