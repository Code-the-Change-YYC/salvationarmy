import { type InferInsertModel, type InferSelectModel, relations, sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { BookingStatus } from "@/types/types";
import { user } from "./auth-schema";
import { bookings } from "./booking-schema";

// Post-trip survey
export const postTripSurveys = pgTable(
  "post_trip_surveys",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    driverId: text("driver_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),

    // Trip completion
    tripCompletionStatus: text("trip_completion_status", {
      enum: [
        BookingStatus.INCOMPLETE,
        BookingStatus.IN_PROGRESS,
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
      ],
    })
      .notNull()
      .default(BookingStatus.COMPLETED),

    // Odometer readings
    startReading: integer("start_reading"),
    endReading: integer("end_reading"),
    timeOfDeparture: timestamp("time_of_departure"),
    timeOfArrival: timestamp("time_of_arrival"),
    destinationAddress: text("destination_address"),

    // Driver feedback
    originalLocationChanged: boolean("original_location_changed"),
    passengerFitRating: integer("passenger_fit_rating"),
    comments: text("comments"),

    // Metadata
    passengerInfo: text("passenger_info"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    passengerFitRatingCheck: check(
      "passenger_fit_rating_check",
      sql`${table.passengerFitRating} >= 1 AND ${table.passengerFitRating} <= 5`,
    ),
  }),
);

// Relations
export const postTripSurveysRelations = relations(postTripSurveys, ({ one }) => ({
  booking: one(bookings, {
    fields: [postTripSurveys.bookingId],
    references: [bookings.id],
  }),
  driver: one(user, {
    fields: [postTripSurveys.driverId],
    references: [user.id],
  }),
}));

export type SurveySelectType = InferSelectModel<typeof postTripSurveys>;
export type SurveyInsertType = InferInsertModel<typeof postTripSurveys>;
