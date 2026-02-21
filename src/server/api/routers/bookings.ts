import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, asc, desc, eq, gt, gte, lt, lte, ne, or } from "drizzle-orm";
import { z } from "zod";
import {
  MAX_GAP_MINUTES_FOR_TRAVEL_CHECK,
  PICKUP_WAIT_TIME_MINUTES,
  TRAVEL_BUFFER_MINUTES,
} from "@/constants/driver-assignment";
import { roundUpToNearestIncrement } from "@/lib/datetime";
import { getTravelTimeMinutes } from "@/lib/google-maps";
import type { db } from "@/server/db";
import { isoTimeRegex, isoTimeRegexFourDigitYears } from "@/types/validation";
import { user } from "../../db/auth-schema";
import { BOOKING_STATUS, type BookingInsertType, bookings } from "../../db/booking-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

dayjs.extend(utc); //Allows dayjs to work in UTC
dayjs.extend(timezone); //Allows dayjs to convert dates between time zones

/** Fallback travel minutes per leg when Google Maps API fails */
const FALLBACK_TRAVEL_MINUTES = 15;

/** TTL for in-memory travel time cache (10 minutes) */
const TRAVEL_TIME_CACHE_TTL_MS = 10 * 60 * 1000;

const travelTimeCache = new Map<string, { value: number; expiresAt: number }>();

const StatusZ = z.enum(BOOKING_STATUS); // ← uses "cancelled" (double-L)

type DbContext = { db: typeof db };

/**
 * Throws if the session user is not admin and not the booking's agency.
 * @param session - Session with user id and role
 * @param agencyId - Booking's agency id
 * @throws TRPCError FORBIDDEN when not allowed
 */
function assertCanAccessBooking(
  session: { user: { id: string; role?: string | null } },
  agencyId: string,
): void {
  const role = session.user.role ?? "user";
  const allowed = role === "admin" || agencyId === session.user.id;
  if (!allowed) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have permission to access this booking.",
    });
  }
}

/** Overlap: existing.startTime < endTime AND existing.endTime > startTime */
async function findOverlappingBooking(
  ctx: DbContext,
  params: {
    driverId: string;
    startTime: string;
    endTime: string;
    excludeBookingId?: number;
  },
): Promise<{ id: number } | undefined> {
  const { driverId, startTime, endTime, excludeBookingId } = params;
  const baseCondition = and(
    eq(bookings.driverId, driverId),
    ne(bookings.status, "cancelled"),
    lt(bookings.startTime, endTime),
    gt(bookings.endTime, startTime),
  );
  const whereCondition =
    excludeBookingId !== undefined
      ? and(baseCondition, ne(bookings.id, excludeBookingId))
      : baseCondition;

  const [row] = await ctx.db
    .select({ id: bookings.id })
    .from(bookings)
    .where(whereCondition)
    .limit(1);
  return row;
}

/**
 * Shared helper: validate that the driver has enough time to travel between
 * adjacent bookings. Uses lte/gte to include back-to-back (touching) times.
 * Returns { valid, reason } — does not throw.
 */
async function validateTravelBetweenAdjacentBookings(
  ctx: DbContext,
  params: {
    driverId: string;
    startTime: string;
    endTime: string;
    pickupAddress: string;
    destinationAddress: string;
    excludeBookingId?: number;
  },
): Promise<{ valid: boolean; reason?: string }> {
  const { driverId, startTime, endTime, pickupAddress, destinationAddress, excludeBookingId } =
    params;

  const baseDriverCondition = and(
    eq(bookings.driverId, driverId),
    ne(bookings.status, "cancelled"),
  );
  const excludeCond =
    excludeBookingId !== undefined ? ne(bookings.id, excludeBookingId) : undefined;

  // Previous booking: endTime <= newStartTime (include back-to-back)
  const [prevBooking] = await ctx.db
    .select({
      endTime: bookings.endTime,
      destinationAddress: bookings.destinationAddress,
    })
    .from(bookings)
    .where(
      and(
        baseDriverCondition,
        lte(bookings.endTime, startTime),
        ...(excludeCond ? [excludeCond] : []),
      ),
    )
    .orderBy(desc(bookings.endTime))
    .limit(1);

  if (
    prevBooking?.endTime &&
    prevBooking?.destinationAddress &&
    prevBooking.destinationAddress.trim() !== ""
  ) {
    const prevEndMs = new Date(prevBooking.endTime).getTime();
    const newStartMs = new Date(startTime).getTime();
    const gapMinutes = (newStartMs - prevEndMs) / (60 * 1000);

    if (gapMinutes <= MAX_GAP_MINUTES_FOR_TRAVEL_CHECK) {
      const travelMinutesResult = await getTravelTimeMinutes(
        prevBooking.destinationAddress,
        pickupAddress,
      );
      const travelMinutes = travelMinutesResult ?? FALLBACK_TRAVEL_MINUTES;
      if (travelMinutesResult === null) {
        console.warn(
          "Travel time lookup failed, using fallback:",
          { from: prevBooking.destinationAddress, to: pickupAddress },
          `Using ${FALLBACK_TRAVEL_MINUTES} min fallback`,
        );
      }
      const requiredMinutes = travelMinutes + TRAVEL_BUFFER_MINUTES;

      if (gapMinutes < requiredMinutes) {
        return {
          valid: false,
          reason: `Driver needs ${travelMinutes} min to travel from previous booking's destination to this pickup (plus ${TRAVEL_BUFFER_MINUTES} min buffer). Not enough time between bookings.`,
        };
      }
    }
  }

  // Next booking: startTime >= newEndTime (include back-to-back)
  const [nextBooking] = await ctx.db
    .select({
      startTime: bookings.startTime,
      pickupAddress: bookings.pickupAddress,
    })
    .from(bookings)
    .where(
      and(
        baseDriverCondition,
        gte(bookings.startTime, endTime),
        ...(excludeCond ? [excludeCond] : []),
      ),
    )
    .orderBy(asc(bookings.startTime))
    .limit(1);

  if (
    nextBooking?.startTime &&
    nextBooking?.pickupAddress &&
    nextBooking.pickupAddress.trim() !== ""
  ) {
    const newEndMs = new Date(endTime).getTime();
    const nextStartMs = new Date(nextBooking.startTime).getTime();
    const gapMinutes = (nextStartMs - newEndMs) / (60 * 1000);

    if (gapMinutes <= MAX_GAP_MINUTES_FOR_TRAVEL_CHECK) {
      const travelMinutesResult = await getTravelTimeMinutes(
        destinationAddress,
        nextBooking.pickupAddress,
      );
      const travelMinutes = travelMinutesResult ?? FALLBACK_TRAVEL_MINUTES;
      if (travelMinutesResult === null) {
        console.warn(
          "Travel time lookup failed, using fallback:",
          { from: destinationAddress, to: nextBooking.pickupAddress },
          `Using ${FALLBACK_TRAVEL_MINUTES} min fallback`,
        );
      }
      const requiredMinutes = travelMinutes + TRAVEL_BUFFER_MINUTES;

      if (gapMinutes < requiredMinutes) {
        return {
          valid: false,
          reason: `Driver needs ${travelMinutes} min to travel from this destination to the next booking's pickup (plus ${TRAVEL_BUFFER_MINUTES} min buffer). Not enough time between bookings.`,
        };
      }
    }
  }

  return { valid: true };
}

/** Overlap + travel validation; throws TRPCError on failure. */
async function validateDriverForSlot(
  ctx: DbContext,
  params: {
    driverId: string;
    startTime: string;
    endTime: string;
    pickupAddress: string;
    destinationAddress: string;
    excludeBookingId?: number;
  },
): Promise<void> {
  if (await findOverlappingBooking(ctx, params)) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Driver has another booking at that time.",
    });
  }
  const travelResult = await validateTravelBetweenAdjacentBookings(ctx, params);
  if (!travelResult.valid) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: travelResult.reason ?? "Not enough travel time between bookings.",
    });
  }
}

export const bookingsRouter = createTRPCRouter({
  /** Returns the current user id and role for the debug form default agencyId. */
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.session.user.id,
      role: ctx.session.user.role ?? "user",
    };
  }),

  /** Returns all drivers (id, name; email only for admins). */
  listDrivers: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = ctx.session.user.role === "admin";
    const drivers = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        ...(isAdmin ? { email: user.email } : {}),
      })
      .from(user)
      .where(eq(user.role, "driver"))
      .orderBy(asc(user.name));

    return drivers;
  }),

  /** Checks driver availability for a time range (overlap and travel time). */
  isDriverAvailable: protectedProcedure
    .input(
      z.object({
        driverId: z.string().min(1),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        pickupAddress: z.string().min(1).optional(),
        destinationAddress: z.string().min(1).optional(),
        /**
         * Optional booking ID to exclude from the overlap check.
         * Useful when editing an existing booking.
         */
        excludeBookingId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { driverId, startTime, endTime, excludeBookingId, pickupAddress, destinationAddress } =
        input;

      if (await findOverlappingBooking(ctx, { driverId, startTime, endTime, excludeBookingId })) {
        return { available: false, reason: "Driver has another booking at that time." };
      }

      if (pickupAddress && destinationAddress) {
        const travelResult = await validateTravelBetweenAdjacentBookings(ctx, {
          driverId,
          startTime,
          endTime,
          pickupAddress,
          destinationAddress,
          excludeBookingId,
        });
        if (!travelResult.valid) {
          return { available: false, reason: travelResult.reason };
        }
      }

      return { available: true };
    }),

  /** Returns estimated end time from start + pickup wait + travel time (cached). */
  getEstimatedEndTime: protectedProcedure
    .input(
      z.object({
        pickupAddress: z.string().min(1),
        destinationAddress: z.string().min(1),
        startTime: z.string().datetime(),
      }),
    )
    .query(async ({ input }) => {
      const cacheKey = `${input.pickupAddress}|${input.destinationAddress}`;
      const now = Date.now();
      const cached = travelTimeCache.get(cacheKey);
      let drivingTimeMinutes: number;
      let usedCached: boolean;
      let usedFallback: boolean;
      if (cached && cached.expiresAt > now) {
        drivingTimeMinutes = cached.value;
        usedCached = true;
        usedFallback = false;
      } else {
        const apiResult = await getTravelTimeMinutes(input.pickupAddress, input.destinationAddress);
        usedCached = false;
        usedFallback = apiResult === null;
        drivingTimeMinutes = apiResult ?? FALLBACK_TRAVEL_MINUTES;
        travelTimeCache.set(cacheKey, {
          value: drivingTimeMinutes,
          expiresAt: now + TRAVEL_TIME_CACHE_TTL_MS,
        });
      }

      const totalBookingMinutes = PICKUP_WAIT_TIME_MINUTES + drivingTimeMinutes;

      const start = new Date(input.startTime);
      const end = new Date(start.getTime());
      end.setMinutes(end.getMinutes() + totalBookingMinutes);

      const estimatedEndTime = roundUpToNearestIncrement(end).toISOString();

      return {
        location1: input.pickupAddress,
        location2: input.destinationAddress,
        drivingTimeMinutes,
        totalBookingMinutes,
        startTime: input.startTime,
        estimatedEndTime,
        usedCached,
        usedFallback,
      };
    }),

  /** Creates a booking; validates driver slot when driverId is set. */
  create: protectedProcedure
    .input(
      z
        .object({
          title: z.string().min(1),
          pickupAddress: z.string().min(1),
          destinationAddress: z.string().min(1),
          passengerInfo: z.string().min(1),
          agencyId: z.string().min(1),

          // Required because DB has .notNull()
          startTime: z.string().datetime(),
          endTime: z.string().datetime(),

          // Optional fields
          purpose: z.string().optional(),
          phoneNumber: z.string().max(25).optional().nullable(),
          driverId: z.string().nullable().optional(),
          status: StatusZ.optional(),
        })
        .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
          message: "endTime must be after startTime",
          path: ["endTime"],
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const role = ctx.session.user.role ?? "user";

      // Only allow admins to specify agencyId; non-admins use their own ID
      const agencyId = role === "admin" ? input.agencyId : userId;

      const bookingData: BookingInsertType = {
        title: input.title,
        pickupAddress: input.pickupAddress,
        destinationAddress: input.destinationAddress,
        passengerInfo: input.passengerInfo,
        agencyId,
        startTime: input.startTime,
        endTime: input.endTime,

        createdBy: userId,
      };

      // Only include optional fields if they are actually provided
      if (input.purpose !== undefined) bookingData.purpose = input.purpose;
      if (input.phoneNumber !== undefined) bookingData.phoneNumber = input.phoneNumber;
      if (input.driverId !== undefined) bookingData.driverId = input.driverId;
      if (input.status !== undefined) bookingData.status = input.status;

      const rows = await ctx.db.transaction(async (tx) => {
        if (input.driverId) {
          await validateDriverForSlot(
            { db: tx as unknown as typeof db },
            {
              driverId: input.driverId,
              startTime: input.startTime,
              endTime: input.endTime,
              pickupAddress: input.pickupAddress,
              destinationAddress: input.destinationAddress,
            },
          );
        }
        return tx.insert(bookings).values(bookingData).returning();
      });
      const row = rows[0];

      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create booking",
        });
      }
      return row;
    }),

  /** Returns a single booking by id after access check. */
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const row = await ctx.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, input.id))
      .limit(1)
      .then((r) => r[0]);

    if (!row)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Booking not found",
      });

    assertCanAccessBooking(ctx.session, row.agencyId);
    return row;
  }),

  /** Returns bookings (filtered by date and optional survey flag); access by agency. */
  getAll: protectedProcedure
    .input(
      z
        .object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          surveyCompleted: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const role = ctx.session.user.role ?? "user";
      const startDate = input?.startDate ?? "1970-01-01T00:00:00-07:00";
      let endDate = input?.endDate ?? "";

      if (input === undefined || input.endDate === undefined) {
        // No end date given; use explicit format so result matches isoTimeRegexFourDigitYears (-07:00)
        endDate = dayjs()
          .utc()
          .add(50, "year")
          .tz("America/Hermosillo")
          .format("YYYY-MM-DDTHH:mm:ssZ");
      }

      let startAndEndDateErrorMessage = "Invalid: ";

      if (!(isoTimeRegex.test(startDate) || isoTimeRegexFourDigitYears.test(startDate))) {
        startAndEndDateErrorMessage = `${startAndEndDateErrorMessage}Start Date `;
      }

      if (!(isoTimeRegex.test(endDate) || isoTimeRegexFourDigitYears.test(endDate))) {
        startAndEndDateErrorMessage = `${startAndEndDateErrorMessage}End Date `;
      }

      if (startAndEndDateErrorMessage !== "Invalid: ") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: startAndEndDateErrorMessage,
        });
      }

      const conditions = [gte(bookings.startTime, startDate), lt(bookings.startTime, endDate)];

      if (input?.surveyCompleted !== undefined) {
        conditions.push(eq(bookings.surveyCompleted, input.surveyCompleted));
      }

      if (role === "admin") {
        return ctx.db
          .select()
          .from(bookings)
          .where(and(...conditions))
          .orderBy(desc(bookings.createdAt));
      }

      return ctx.db
        .select()
        .from(bookings)
        .where(
          and(
            or(
              eq(bookings.createdBy, userId),
              eq(bookings.agencyId, userId),
              eq(bookings.driverId, userId),
            ),
            ...conditions,
          ),
        )
        .orderBy(desc(bookings.createdAt));
    }),

  /** Updates a booking; re-validates driver when driver or time/address changes. */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        pickupAddress: z.string().optional(),
        destinationAddress: z.string().optional(),
        purpose: z.string().optional(),
        passengerInfo: z.string().optional(),
        driverId: z.string().optional().nullable(),
        status: StatusZ.optional(),
        startTime: z.string().datetime().optional(),
        endTime: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // 1) Ensure booking exists
      const existing = await ctx.db
        .select()
        .from(bookings)
        .where(eq(bookings.id, id))
        .limit(1)
        .then((r) => r[0]);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      assertCanAccessBooking(ctx.session, existing.agencyId);

      const userId = ctx.session.user.id;
      // 3) Filter only defined updates
      const updatesToApply = Object.fromEntries(
        Object.entries(updates).filter(([, v]) => v !== undefined),
      );

      const driverId =
        updatesToApply.driverId !== undefined ? updatesToApply.driverId : existing.driverId;
      const needsDriverValidation =
        driverId != null &&
        driverId !== "" &&
        (updatesToApply.driverId !== undefined ||
          updatesToApply.startTime !== undefined ||
          updatesToApply.endTime !== undefined ||
          updatesToApply.pickupAddress !== undefined ||
          updatesToApply.destinationAddress !== undefined);

      const res = await ctx.db.transaction(async (tx) => {
        if (needsDriverValidation) {
          const proposedStart = updatesToApply.startTime ?? existing.startTime;
          const proposedEnd = updatesToApply.endTime ?? existing.endTime;
          const proposedPickup = updatesToApply.pickupAddress ?? existing.pickupAddress;
          const proposedDest = updatesToApply.destinationAddress ?? existing.destinationAddress;

          await validateDriverForSlot(
            { db: tx as unknown as typeof db },
            {
              driverId,
              startTime: proposedStart,
              endTime: proposedEnd,
              pickupAddress: proposedPickup,
              destinationAddress: proposedDest,
              excludeBookingId: id,
            },
          );
        }

        return tx
          .update(bookings)
          .set({
            ...updatesToApply,
            updatedBy: userId,
          })
          .where(eq(bookings.id, id))
          .returning();
      });

      return res[0];
    }),

  /** Sets booking status to cancelled. */
  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.id))
        .limit(1)
        .then((r) => r[0]);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      assertCanAccessBooking(ctx.session, existing.agencyId);

      return ctx.db
        .update(bookings)
        .set({ status: "cancelled", updatedBy: ctx.session.user.id })
        .where(eq(bookings.id, input.id))
        .returning()
        .then((r) => r[0]);
    }),
});
