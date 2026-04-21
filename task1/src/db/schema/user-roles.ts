import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { roles } from './roles';

export const userRoles = sqliteTable('user_roles', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.userId, table.roleId] }),
]);
