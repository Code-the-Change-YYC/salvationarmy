import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { bookings } from "./booking-schema";

export const passengers = pgTable("passengers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  notes: text("notes"), // accessibility needs / comments
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelation: text("emergency_contact_relation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const bookingPassengers = pgTable("booking_passengers", {
  id: serial("id").primaryKey(),

  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),

  passengerId: integer("passenger_id")
    .notNull()
    .references(() => passengers.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations

export const passengersRelations = relations(passengers, ({ many }) => ({
  bookings: many(bookingPassengers),
}));

export const bookingPassengersRelations = relations(bookingPassengers, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingPassengers.bookingId],
    references: [bookings.id],
  }),
  passenger: one(passengers, {
    fields: [bookingPassengers.passengerId],
    references: [passengers.id],
  }),
}));
