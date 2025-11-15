import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  purpose: text("purpose"),
  passengerInfo: text("passengerInfo").notNull(),
  status: text("status", { enum: ["incomplete", "completed", "in-progress", "cancelled"] })
    .notNull()
    .default("incomplete"),
  // the agency that created the booking
  agencyId: text("agency_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  endTime: timestamp("end_time", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  driverId: text("driver_id").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date()),
  createdBy: text("created_by").references(() => user.id),
  updatedBy: text("updated_by").references(() => user.id),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  agency: one(user, {
    fields: [bookings.agencyId],
    references: [user.id],
    relationName: "agencyBookings",
  }),
  driver: one(user, {
    fields: [bookings.driverId],
    references: [user.id],
    relationName: "driverBookings",
  }),
}));
