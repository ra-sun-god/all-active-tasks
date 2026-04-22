// db.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { entities } from './schema/entities';
import { collections } from './schema/collections';
import { users } from './schema/users';
import path from 'path';

const dbPath = path.resolve(__dirname + "/../../.database/collections_db.sqlite")

console.log("dbPath===>", dbPath)

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, {
  schema: { ...users, ...entities, ...collections }
});
