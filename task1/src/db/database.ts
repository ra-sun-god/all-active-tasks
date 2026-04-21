// db.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import { entities, permissions, reviews, rolePermissions, roles, userRoles, users } from './schema';

const dbPath = path.resolve(__dirname + "/../../.database/collections_db.sqlite")

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, {
  schema: {
    ...users,
    ...entities,
    ...reviews,
    ...roles,
    ...permissions,
    ...rolePermissions,
    ...userRoles
  }
});
