import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { collections } from "./collections";
import { sql } from "drizzle-orm";
import { entities } from "./entities";

export const collectionEntities = sqliteTable('collection_entities', {
  collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  entityId: text('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  addedAt: integer("added_at",{ mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  note: text('note'),
}, (table) => ({
  pk: primaryKey({ columns: [table.collectionId, table.entityId] }),
  collectionIdx: index('collection_entities_collection_idx').on(table.collectionId),
  entityIdx: index('collection_entities_entity_idx').on(table.entityId),
}));
