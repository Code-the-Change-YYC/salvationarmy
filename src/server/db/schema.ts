import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema"; // user table from auth schema

export const forms = sqliteTable("form", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  title: text("title").notNull(),
  description: text("description"),

  submittedById: text("submitted_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(cast(unixepoch('subsecond') as integer))`) // might need to change this was just chatgpt
    .notNull(),
});

export const formsRelations = relations(forms, ({ one }) => ({
  submittedBy: one(user, {
    fields: [forms.submittedById],
    references: [user.id],
  }),
}));
