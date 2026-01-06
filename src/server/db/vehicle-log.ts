import { relations, type SQL, sql } from "drizzle-orm";
import { check, date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const logs = pgTable(
  "logs",
  {
    id: serial("id").primaryKey(),
    date: date("date").notNull(),
    travelLocation: text("travel_location").notNull(),
    departureTime: timestamp("departure_time", {
      mode: "string",
      withTimezone: true,
    }).notNull(),
    arrivalTime: timestamp("arrival_time", {
      mode: "string",
      withTimezone: true,
    }).notNull(),
    //odometer readings in KM
    odometerStart: integer("odometer_start").notNull(),
    odometerEnd: integer("odometer_end").notNull(),
    kilometersDriven: integer("kilometers_driven")
      .generatedAlwaysAs((): SQL => sql`${logs.odometerEnd} - ${logs.odometerStart}`)
      .notNull(),
    driverId: text("driver_id")
      .references(() => user.id, {
        onDelete: "restrict",
      })
      .notNull(),
    driverName: text("driver_name").notNull(),
    // Name of the vehicle
    vehicle: text("vehicle").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    createdBy: text("created_by").references(() => user.id),
    updatedBy: text("updated_by").references(() => user.id),
  },
  (table) => [
    check("odometer_check", sql`${table.odometerEnd} > ${table.odometerStart}`),
    check("time_check", sql`${table.arrivalTime} > ${table.departureTime}`),
  ],
);

export const logsRelations = relations(logs, ({ one }) => ({
  driver: one(user, {
    fields: [logs.driverId],
    references: [user.id],
    relationName: "driverLogs",
  }),
}));
