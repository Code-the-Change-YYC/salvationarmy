import { eq } from "drizzle-orm";
import { user } from "@/server/db/auth-schema";
import { bookings } from "@/server/db/booking-schema";
import { postTripSurveys } from "@/server/db/post-trip-schema";
import { adminProcedure, createTRPCRouter } from "../trpc";

export const vehicleLogsRouter = createTRPCRouter({
  // get all vehicle logs by joining post-trip surveys with bookings and drivers
  getAll: adminProcedure.query(async ({ ctx }) => {
    // join postTripSurveys -> bookings -> user (driver)
    const results = await ctx.db
      .select({
        surveyId: postTripSurveys.id,
        date: postTripSurveys.timeOfDeparture,
        destination: postTripSurveys.destinationAddress,
        departureTime: postTripSurveys.timeOfDeparture,
        arrivalTime: postTripSurveys.timeOfArrival,
        odometerStart: postTripSurveys.startReading,
        odometerEnd: postTripSurveys.endReading,
        driverName: user.name,
        bookingDestination: bookings.destinationAddress,
        bookingStartTime: bookings.startTime,
      })
      .from(postTripSurveys)
      .innerJoin(bookings, eq(postTripSurveys.bookingId, bookings.id))
      .innerJoin(user, eq(postTripSurveys.driverId, user.id));

    // transform to match frontend interface
    return results.map((row) => {
      const kmDriven =
        row.odometerEnd && row.odometerStart ? row.odometerEnd - row.odometerStart : 0;

      return {
        DATE: row.date || row.bookingStartTime || "",
        DESTINATION: row.destination || row.bookingDestination || "",
        DEPARTURE_TIME: row.departureTime || "",
        ARRIVAL_TIME: row.arrivalTime || "",
        ODOMETER_START: row.odometerStart || 0,
        ODOMETER_END: row.odometerEnd || 0,
        KM_DRIVEN: kmDriven,
        DRIVER: row.driverName || "Unknown",
      };
    });
  }),
});
