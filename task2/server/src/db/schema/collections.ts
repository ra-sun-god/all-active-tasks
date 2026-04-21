import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { sql } from 'drizzle-orm';

export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer("created_at",{ mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at",{ mode: "timestamp" }).notNull().default(sql`(unixepoch())`).$onUpdate(() => sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('collections_user_id_idx').on(table.userId),
}));
