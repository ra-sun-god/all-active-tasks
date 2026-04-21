import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),        // e.g., 'admin', 'moderator'
  description: text('description'),              // optional: 'Can delete any review'
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
