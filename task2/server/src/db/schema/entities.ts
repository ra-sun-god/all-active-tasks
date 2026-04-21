import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const entities = sqliteTable("entities", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  category: text('category'),
  imageUrl: text('image_url'),
  createdAt: integer("created_at",{ mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at",{ mode: "timestamp" }).notNull().default(sql`(unixepoch())`).$onUpdate(() => sql`(unixepoch())`),
});
