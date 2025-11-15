import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
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
  // Survey questions
  surveyQuestions: jsonb("survey_questions"), // e.g., { question1: "...", question2: "...", etc. }
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
  rating: integer("rating"),
  comments: text("comments"),
  // Answers to survey
  surveyAnswers: jsonb("survey_answers"), // e.g., { answer1: "...", answer2: "...", etc. }
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
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
