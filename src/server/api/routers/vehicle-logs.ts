import { desc } from "drizzle-orm";
import { logs } from "@/server/db/vehicle-log";
import { adminProcedure, createTRPCRouter } from "../trpc";

export const vehicleLogsRouter = createTRPCRouter({
  // get all vehicle logs from the logs table
  getAll: adminProcedure.query(async ({ ctx }) => {
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
      })
      .from(logs)
      .orderBy(desc(logs.date));

    // transform to match frontend interface
    return results.map((row) => ({
      DATE: row.date || "",
      DESTINATION: row.destination || "",
      DEPARTURE_TIME: row.departureTime || "",
      ARRIVAL_TIME: row.arrivalTime || "",
      ODOMETER_START: row.odometerStart || 0,
      ODOMETER_END: row.odometerEnd || 0,
      KM_DRIVEN: row.kilometersDriven || 0,
      DRIVER: row.driverName || "Unknown",
    }));
  }),
});
