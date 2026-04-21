import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const permissions = sqliteTable('permissions', {
  id: integer().primaryKey(),
  name: text().notNull().unique(), // 'reviews:delete', 'users:ban', etc.
});
