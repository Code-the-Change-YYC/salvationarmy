import { type InferInsertModel, type InferSelectModel, relations } from "drizzle-orm";
import { boolean, index, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const BOOKING_STATUS = ["incomplete", "completed", "in-progress", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    pickupAddress: text("pickup_address").notNull(),
    destinationAddress: text("destination_address").notNull(),
    purpose: text("purpose"),
    passengerInfo: text("passenger_info").notNull(),
    phoneNumber: varchar("phone_number", { length: 25 }),
    surveyCompleted: boolean("survey_completed").default(false).notNull(),
    status: text("status", { enum: BOOKING_STATUS }).notNull().default("incomplete"),
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
  },
  // Runs after the table is created
  (table) => [
    index("bookings_start_time_idx").on(table.startTime),
    index("bookings_driver_overlap_idx").on(
      table.driverId,
      table.status,
      table.startTime,
      table.endTime,
    ),
    index("bookings_driver_end_time_idx").on(table.driverId, table.endTime),
  ],
);

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

export type BookingSelectType = InferSelectModel<typeof bookings>;
export type BookingInsertType = InferInsertModel<typeof bookings>;
