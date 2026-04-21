import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  userName: text("user_name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at",{ mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at",{ mode: "timestamp" }).notNull().default(sql`(unixepoch())`).$onUpdate(() => sql`(unixepoch())`),
});
