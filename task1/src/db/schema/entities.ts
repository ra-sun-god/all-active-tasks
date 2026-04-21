import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const entities = sqliteTable("entities", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  avgRating: real("avg_rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: integer("created_at",{ mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at",{ mode: "timestamp" }).notNull().default(sql`(unixepoch())`).$onUpdate(() => sql`(unixepoch())`),
});
