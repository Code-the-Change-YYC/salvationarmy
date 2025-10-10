import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema"; // user table from auth schema

export const forms = pgTable("form", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  submittedById: text("submitted_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const formsRelations = relations(forms, ({ one }) => ({
  submittedBy: one(user, {
    fields: [forms.submittedById],
    references: [user.id],
  }),
}));
