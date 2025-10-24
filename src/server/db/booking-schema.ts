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
  status: text("status", { enum: ["incomplete", "completed", "in-progress"] })
    .notNull()
    .default("incomplete"),
  driverId: text("driver_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  driver: one(user, {
    fields: [bookings.driverId],
    references: [user.id],
  }),
}));
