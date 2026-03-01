import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { logs } from "@/server/db/vehicle-log";
import { adminProcedure, createTRPCRouter } from "../trpc";

export const vehicleLogsRouter = createTRPCRouter({
  // get all vehicle logs, with optional filtering by vehicle, driverName, and date range
  getAll: adminProcedure
    .input(
      z
        .object({
          vehicle: z.string().optional(),
          driverName: z.string().optional(),
          dateFrom: z.string().optional(), // ISO date string "YYYY-MM-DD"
          dateTo: z.string().optional(), // ISO date string "YYYY-MM-DD"
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const filters = [];

      if (input?.vehicle) {
        filters.push(eq(logs.vehicle, input.vehicle));
      }
      if (input?.driverName) {
        filters.push(eq(logs.driverName, input.driverName));
      }
      if (input?.dateFrom) {
        filters.push(gte(logs.date, input.dateFrom));
      }
      if (input?.dateTo) {
        filters.push(lte(logs.date, input.dateTo));
      }

      const results = await ctx.db
        .select({
          id: logs.id,
          date: logs.date,
          destination: logs.travelLocation,
          departureTime: logs.departureTime,
          arrivalTime: logs.arrivalTime,
          odometerStart: logs.odometerStart,
          odometerEnd: logs.odometerEnd,
          kilometersDriven: logs.kilometersDriven,
          driverName: logs.driverName,
          vehicle: logs.vehicle,
        })
        .from(logs)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(logs.date));

      // transform to match frontend interface
      return results.map((row) => ({
        ID: row.id,
        DATE: row.date ?? "",
        DESTINATION: row.destination ?? "",
        DEPARTURE_TIME: row.departureTime ?? "",
        ARRIVAL_TIME: row.arrivalTime ?? "",
        ODOMETER_START: row.odometerStart ?? 0,
        ODOMETER_END: row.odometerEnd ?? 0,
        KM_DRIVEN: row.kilometersDriven ?? 0,
        DRIVER: row.driverName ?? "Unknown",
        VEHICLE: row.vehicle ?? "",
      }));
    }),

  // create a new vehicle log
  create: adminProcedure
    .input(
      z
        .object({
          date: z.string().min(1, "Date is required"),
          travelLocation: z.string().min(1, "Destination is required"),
          departureTime: z.string().min(1, "Departure time is required"),
          arrivalTime: z.string().min(1, "Arrival time is required"),
          odometerStart: z.number().int().nonnegative(),
          odometerEnd: z.number().int().nonnegative(),
          // driverId is optional — falls back to the session user when omitted
          driverId: z.string().optional(),
          driverName: z.string().min(1, "Driver name is required"),
          vehicle: z.string().min(1, "Vehicle is required"),
        })
        .refine((data) => data.odometerEnd > data.odometerStart, {
          message: "Odometer end must be greater than odometer start",
          path: ["odometerEnd"],
        })
        .refine((data) => new Date(data.arrivalTime) > new Date(data.departureTime), {
          message: "Arrival time must be after departure time",
          path: ["arrivalTime"],
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [row] = await ctx.db
        .insert(logs)
        .values({
          date: input.date,
          travelLocation: input.travelLocation,
          departureTime: input.departureTime,
          arrivalTime: input.arrivalTime,
          odometerStart: input.odometerStart,
          odometerEnd: input.odometerEnd,
          driverId: input.driverId ?? userId,
          driverName: input.driverName,
          vehicle: input.vehicle,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create vehicle log",
        });
      }

      return row;
    }),

  // update an existing vehicle log by id
  update: adminProcedure
    .input(
      z
        .object({
          id: z.number().int().positive(),
          date: z.string().min(1).optional(),
          travelLocation: z.string().min(1).optional(),
          departureTime: z.string().min(1).optional(),
          arrivalTime: z.string().min(1).optional(),
          odometerStart: z.number().int().nonnegative().optional(),
          odometerEnd: z.number().int().nonnegative().optional(),
          driverId: z.string().min(1).optional(),
          driverName: z.string().min(1).optional(),
          vehicle: z.string().min(1).optional(),
        })
        .refine(
          (data) => {
            if (data.odometerEnd !== undefined && data.odometerStart !== undefined) {
              return data.odometerEnd > data.odometerStart;
            }
            return true;
          },
          {
            message: "Odometer end must be greater than odometer start",
            path: ["odometerEnd"],
          },
        )
        .refine(
          (data) => {
            if (data.arrivalTime !== undefined && data.departureTime !== undefined) {
              return new Date(data.arrivalTime) > new Date(data.departureTime);
            }
            return true;
          },
          {
            message: "Arrival time must be after departure time",
            path: ["arrivalTime"],
          },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...fields } = input;
      const userId = ctx.session.user.id;

      const [row] = await ctx.db
        .update(logs)
        .set({ ...fields, updatedBy: userId })
        .where(eq(logs.id, id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Vehicle log with id ${id} not found`,
        });
      }

      return row;
    }),

  // delete a vehicle log by id ("can be created, but seems unlikely to be used")
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .delete(logs)
        .where(eq(logs.id, input.id))
        .returning({ id: logs.id });

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Vehicle log with id ${input.id} not found`,
        });
      }

      return { success: true, id: row.id };
    }),
});
