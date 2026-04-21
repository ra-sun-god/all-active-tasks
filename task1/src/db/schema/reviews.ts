import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { entities } from "./entities";

export const reviews = sqliteTable("reviews", {
  id: integer().primaryKey({ autoIncrement: true }),  
  entityId: integer("entity_id").notNull() .references(() => entities.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer().notNull(),
  comment: text(),
  createdAt: integer("created_at",{ mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at",{ mode: "timestamp" }).notNull().default(sql`(unixepoch())`).$onUpdate(() => sql`(unixepoch())`),
}, (table) => ([
  index("entity_id_created_at_idx").on(table.entityId, table.createdAt),
  index("user_id_idx").on(table.userId),
  uniqueIndex("user_entity_unique").on(table.userId, table.entityId),
]))
