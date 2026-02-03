import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, desc, eq, gte, lt, or } from "drizzle-orm";
import { z } from "zod";
import { bookings } from "@/server/db/booking-schema";
import { postTripSurveys, type SurveyInsertType } from "@/server/db/post-trip-schema";
import { BookingStatus } from "@/types/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const surveysRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({
          bookingId: z.number(),
          driverId: z.string(),
          tripCompletionStatus: z.enum([
            BookingStatus.INCOMPLETE,
            BookingStatus.IN_PROGRESS,
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED,
          ]),
          startReading: z.number().int().positive().optional(),
          endReading: z.number().int().positive().optional(),
          timeOfDeparture: z.string().datetime().optional(),
          timeOfArrival: z.string().datetime().optional(),
          destinationAddress: z.string().optional(),
          originalLocationChanged: z.boolean().optional(),
          passengerFitRating: z.number().int().min(1).max(5).optional(),
          comments: z.string().optional(),
        })
        .refine(
          (data) => {
            if (data.endReading !== undefined && data.startReading !== undefined) {
              return data.endReading > data.startReading;
            }
            return true;
          },
          {
            message: "End reading must be greater than start reading",
            path: ["endReading"],
          },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const role = ctx.session.user.role ?? "user";

      // only drivers/admins can create bookings
      if (role !== "admin" && role !== "driver") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins and drivers can create surveys",
        });
      }

      // verify booking exists
      const booking = await ctx.db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.bookingId))
        .limit(1)
        .then((r) => r[0]);

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // verify driver updating booking is assigned to the booking
      if (role === "driver" && booking.driverId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only create surveys for your own bookings",
        });
      }

      // booking has ended (the survey can be created)
      const now = dayjs();
      const bookingEndTime = dayjs(booking.endTime);
      if (bookingEndTime.isAfter(now)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot create survey before booking end time has passed",
        });
      }

      // survey cant already exist for the booking
      const existingSurvey = await ctx.db
        .select()
        .from(postTripSurveys)
        .where(eq(postTripSurveys.bookingId, input.bookingId))
        .limit(1)
        .then((r) => r[0]);

      if (existingSurvey) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A survey already exists for this booking",
        });
      }

      // there should be a assigned driver...?
      if (!booking.driverId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Booking does not have an assigned driver",
        });
      }

      // create the survey
      const [surveyRow] = await ctx.db
        .insert(postTripSurveys)
        .values({
          bookingId: input.bookingId,
          driverId: booking.driverId,
          tripCompletionStatus: input.tripCompletionStatus,
          startReading: input.startReading,
          endReading: input.endReading,
          timeOfDeparture: input.timeOfDeparture ? new Date(input.timeOfDeparture) : undefined,
          timeOfArrival: input.timeOfArrival ? new Date(input.timeOfArrival) : undefined,
          destinationAddress: input.destinationAddress,
          originalLocationChanged: input.originalLocationChanged,
          passengerFitRating: input.passengerFitRating,
          comments: input.comments,
        })
        .returning();

      if (!surveyRow) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create survey",
        });
      }

      // finally update it so that the booking has survey completed
      await ctx.db
        .update(bookings)
        .set({ surveyCompleted: true })
        .where(eq(bookings.id, input.bookingId));

      return surveyRow;
    }),

  // Get a specific survey by ID
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const role = ctx.session.user.role ?? "user";

    const row = await ctx.db
      .select()
      .from(postTripSurveys)
      .where(eq(postTripSurveys.id, input.id))
      .limit(1)
      .then((r) => r[0]);

    if (!row) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Survey not found",
      });
    }

    // Authorization: admins can view all, drivers can only view their own
    const allowed = role === "admin" || row.driverId === userId;

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to view this survey",
      });
    }

    return row;
  }),

  // Get all surveys (with optional date filtering)
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

      const startDate = input?.startDate ?? "1970-01-01T00:00:00-07:00";
      const endDate = input?.endDate ?? dayjs().add(100, "years").toISOString();

      const conditions = [
        gte(postTripSurveys.createdAt, new Date(startDate)),
        lt(postTripSurveys.createdAt, new Date(endDate)),
      ];

      // Drivers only see their own surveys, admins see all
      if (role === "driver") {
        conditions.push(eq(postTripSurveys.driverId, userId));
      } else if (role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins and drivers can view surveys",
        });
      }

      const rows = await ctx.db
        .select()
        .from(postTripSurveys)
        .where(and(...conditions))
        .orderBy(desc(postTripSurveys.createdAt));

      return rows;
    }),

  // Get bookings that need surveys (completed but no survey yet)
  getBookingsNeedingSurveys: protectedProcedure
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
      const role = ctx.session.user.role;

      const now = dayjs();
      const startDate = input?.startDate ?? "1970-01-01T00:00:00-07:00";
      const endDate = input?.endDate ?? now.toISOString();

      // Build the base conditions
      const conditions = [
        // Booking end time has passed
        lt(bookings.endTime, dayjs().toISOString()),
        // Filter by date range on booking creation
        gte(bookings.createdAt, new Date(startDate)),
        lt(bookings.createdAt, new Date(endDate)),
      ];

      // Drivers only see their own bookings, admins see all
      if (role === "driver") {
        conditions.push(eq(bookings.driverId, userId));
      } else if (role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins and drivers can view bookings",
        });
      }

      // Get all bookings matching conditions
      const allBookings = await ctx.db
        .select()
        .from(bookings)
        .where(and(...conditions))
        .orderBy(desc(bookings.endTime));

      // Get all surveys for these bookings
      const bookingIds = allBookings.map((b) => b.id);
      const existingSurveys = await ctx.db
        .select()
        .from(postTripSurveys)
        .where(
          bookingIds.length > 0
            ? or(...bookingIds.map((id) => eq(postTripSurveys.bookingId, id)))
            : undefined,
        );

      const surveyBookingIds = new Set(existingSurveys.map((s) => s.bookingId));

      // Filter out bookings that already have surveys
      const bookingsNeedingSurveys = allBookings.filter(
        (booking) => !surveyBookingIds.has(booking.id),
      );

      return bookingsNeedingSurveys;
    }),

  // Update an existing survey
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tripCompletionStatus: z
          .enum([
            BookingStatus.INCOMPLETE,
            BookingStatus.IN_PROGRESS,
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED,
          ])
          .optional(),
        startReading: z.number().int().positive().optional(),
        endReading: z.number().int().positive().optional(),
        timeOfDeparture: z.string().datetime().optional(),
        timeOfArrival: z.string().datetime().optional(),
        destinationAddress: z.string().optional(),
        originalLocationChanged: z.boolean().optional(),
        passengerFitRating: z.number().int().min(1).max(5).optional(),
        comments: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const userId = ctx.session.user.id;

      // 1) Ensure survey exists
      const existingSurvey = await ctx.db
        .select()
        .from(postTripSurveys)
        .where(eq(postTripSurveys.id, id))
        .limit(1)
        .then((r) => r[0]);

      if (!existingSurvey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Survey not found",
        });
      }

      // 2) Authorization: only the assigned driver can update
      // (admins could be allowed too if needed, but based on your requirements, only drivers)
      const allowed = existingSurvey.driverId === userId;

      if (!allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own surveys",
        });
      }

      // 3) Validate endReading if both are being set
      if (updates.endReading !== undefined && updates.startReading !== undefined) {
        if (updates.endReading <= updates.startReading) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "End reading must be greater than start reading",
          });
        }
      } else if (updates.endReading !== undefined && existingSurvey.startReading) {
        if (updates.endReading <= existingSurvey.startReading) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "End reading must be greater than start reading",
          });
        }
      }

      // 4) Filter only defined updates (bookingId and driverId are not updateable)
      const updatesToApply: Partial<SurveyInsertType> = {};

      if (updates.tripCompletionStatus !== undefined) {
        updatesToApply.tripCompletionStatus = updates.tripCompletionStatus;
      }
      if (updates.startReading !== undefined) {
        updatesToApply.startReading = updates.startReading;
      }
      if (updates.endReading !== undefined) {
        updatesToApply.endReading = updates.endReading;
      }
      if (updates.timeOfDeparture !== undefined) {
        updatesToApply.timeOfDeparture = new Date(updates.timeOfDeparture);
      }
      if (updates.timeOfArrival !== undefined) {
        updatesToApply.timeOfArrival = new Date(updates.timeOfArrival);
      }
      if (updates.destinationAddress !== undefined) {
        updatesToApply.destinationAddress = updates.destinationAddress;
      }
      if (updates.originalLocationChanged !== undefined) {
        updatesToApply.originalLocationChanged = updates.originalLocationChanged;
      }
      if (updates.passengerFitRating !== undefined) {
        updatesToApply.passengerFitRating = updates.passengerFitRating;
      }
      if (updates.comments !== undefined) {
        updatesToApply.comments = updates.comments;
      }

      // 5) Perform update
      const [res] = await ctx.db
        .update(postTripSurveys)
        .set(updatesToApply)
        .where(eq(postTripSurveys.id, id))
        .returning();

      if (!res) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update survey",
        });
      }

      return res;
    }),
});
