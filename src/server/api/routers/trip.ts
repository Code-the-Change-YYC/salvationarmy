import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { ParseError, parsePhoneNumberWithError } from "libphonenumber-js";
import { z } from "zod";
import { sendBookingCreatedSms } from "@/lib/sms";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { user } from "@/server/db/auth-schema";
import { bookings } from "@/server/db/booking-schema";
import { phoneNumberSchema } from "@/types/validation";
import { appRouter } from "../root";

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
      try {
        const res = phoneNumberSchema.safeParse(input.phoneNumber.trim()); //Check if phone num is valid
        const phoneNumber = parsePhoneNumberWithError(input.phoneNumber);
        if (!res.success || !phoneNumber.isValid()) {
          // Failed regex check or API check
          throw new Error(res.error?.issues[0]?.message ?? "Invalid phone number");
        }
        input.phoneNumber = phoneNumber.number;
      } catch (e) {
        if (e instanceof Error) {
          // Failed regex check or API check
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: e instanceof ParseError ? "Invalid phone number" : e.message,
          });
        }
      }

      const serverCaller = appRouter.createCaller(ctx); //Make a blank ctx for the endpoint we call
      await serverCaller.form
        .validateAddress({
          regionCode: "ca",
          address: [input.pickupAddress],
        })
        .then((result) => {
          if (result === null) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid Pickup Address",
            });
          }
          input.pickupAddress = result;
        });

      await serverCaller.form
        .validateAddress({
          regionCode: "ca",
          address: [input.destinationAddress],
        })
        .then((result) => {
          if (result === null) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid Destination Address",
            });
          }
          input.destinationAddress = result;
        });

      const [inserted] = await ctx.db
        .insert(bookings)
        .values({
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
        })
        .returning({ id: bookings.id });

      if (!inserted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create booking",
        });
      }

      const drivers = await ctx.db
        .select({ phoneNumber: user.phoneNumber })
        .from(user)
        .where(eq(user.role, "driver"));
      const driverPhones = drivers
        .map((d) => d.phoneNumber)
        .filter((n): n is string => Boolean(n?.trim()));

      void sendBookingCreatedSms(
        {
          bookingId: inserted.id,
          purpose: input.purpose,
          startTime: input.startTime,
          endTime: input.endTime,
          pickupAddress: input.pickupAddress,
          destinationAddress: input.destinationAddress,
        },
        driverPhones,
      ).catch((err) => {
        console.error("Failed to send booking created SMS:", err);
      });
    }),
});
