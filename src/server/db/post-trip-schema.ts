import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { bookings } from "./booking-schema";

// Post-trip surveys
export const postTripSurveys = pgTable("post_trip_surveys", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  tripCompletionStatus: text("trip_completion_status", {
    enum: ["completed", "partially_completed", "cancelled", "no_show"],
  })
    .notNull()
    .default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Driver feedback
export const driverFeedback = pgTable("driver_feedback", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id")
    .notNull()
    .references(() => postTripSurveys.id, { onDelete: "cascade" }),
  driverId: text("driver_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  originalLocationChanged: boolean("original_location_changed"),
  passengerFitRating: integer("passenger_fit_rating"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Odometer readings
export const odometerReadings = pgTable("odometer_readings", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  driverId: text("driver_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  startReading: integer("start_reading").notNull(),
  endReading: integer("end_reading"),
  timeOfDeparture: timestamp("time_of_departure"),
  timeOfArrival: timestamp("time_of_arrival"),
  destinationAddress: text("destination_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const postTripSurveysRelations = relations(postTripSurveys, ({ one }) => ({
  booking: one(bookings, {
    fields: [postTripSurveys.bookingId],
    references: [bookings.id],
  }),
}));

export const driverFeedbackRelations = relations(driverFeedback, ({ one }) => ({
  survey: one(postTripSurveys, {
    fields: [driverFeedback.surveyId],
    references: [postTripSurveys.id],
  }),
  driver: one(user, {
    fields: [driverFeedback.driverId],
    references: [user.id],
  }),
}));

// Relations for odometer readings
export const odometerReadingsRelations = relations(odometerReadings, ({ one }) => ({
  booking: one(bookings, {
    fields: [odometerReadings.bookingId],
    references: [bookings.id],
  }),
  driver: one(user, {
    fields: [odometerReadings.driverId],
    references: [user.id],
  }),
}));
