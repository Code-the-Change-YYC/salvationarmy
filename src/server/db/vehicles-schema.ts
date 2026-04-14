import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const vehicles = pgTable("vehicles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
