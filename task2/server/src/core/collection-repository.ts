import { eq, and, desc, count } from 'drizzle-orm';
import { collections } from '../db/schema/collections';
import { db } from '../db';
import { Collection,FindEntitiesByCollectionResult, RepoCreate, User } from '../types';
import { randomUUID } from 'crypto';
import { collectionEntities } from '../db/schema/collection-entities';
import { InternalError } from './collection-errors';
import { reportError } from '../utils';
import { entities, users } from '../db/schema';
import { sql } from 'drizzle-orm';


export class CreateCollectionRepository {

  async createUser(
    email: string,
    passwordHash: string,
    name: string
  ): Promise<User> {

    try {
      const id = randomUUID();
      const [user] = await db.insert(users)
        .values({
          id,
          email,
          passwordHash,
          name
        })
        .returning()

      return user
    } catch (e: any) {
      reportError(e)
      throw new InternalError()
    }
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      return db.select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .get();
    } catch (e: any) {
      reportError(e);
      throw new InternalError();
    }
  }

  async create(data: RepoCreate): Promise<Collection> {

    const { userId, title, description = null, isPublic = false } = data;
    const id = randomUUID();

    const [result] = await db.insert(collections)
      .values({
        id,
        userId,
        title,
        description,
        isPublic
      }).returning();

    return result;
  }

  async findById(id: string): Promise<Collection | undefined> {
    const [result] = await db.select()
      .from(collections)
      .where(eq(collections.id, id));
    return result;
  }

  async findByUserId(userId: string, limit: number, offset: number) {
    const result = await db
      .select({
        id: collections.id,
        userId: collections.userId,
        title: collections.title,
        description: collections.description,
        isPublic: collections.isPublic,
        createdAt: collections.createdAt,
        updatedAt: collections.updatedAt,
    
        //  total count
        totalEntities: sql<number>`
          (
            SELECT COUNT(*)
            FROM collection_entities ce
            WHERE ce.collection_id = ${collections.id}
          )
        `,
    
        //  last 4 entities
        entities: sql<string>`
          (
            SELECT COALESCE(
              json_group_array(
                json_object(
                  'id', e.id,
                  'imageUrl', e.image_url
                )
              ),
              '[]'
            )
            FROM (
              SELECT ce.entity_id
              FROM collection_entities ce
              WHERE ce.collection_id = ${collections.id}
              ORDER BY ce.added_at DESC
              LIMIT 4
            ) AS sub
            JOIN entities e ON e.id = sub.entity_id
          )
        `
      })
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(desc(collections.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result.map(c => ({
      ...c,
      entities: JSON.parse(c.entities || '[]')
    }));
  }
  
  async countByUserId(userId: string): Promise<number> {
    try{
      const [result] = await db.select({ count: count() }).from(collections).where(eq(collections.userId, userId));
      return result.count;
    } catch (e: any) {
      reportError(e);
      throw new InternalError();
    }
  }
  
  async findEntities(requestingUserId: string, limit: number, offset: number) {
    try {
      const rows = await db
        .select({
          id: entities.id,
          name: entities.name,
          description: entities.description,
          latitude: entities.latitude,
          longitude: entities.longitude,
          category: entities.category,
          imageUrl: entities.imageUrl,
          createdAt: entities.createdAt,
          updatedAt: entities.updatedAt,
          // Aggregates only collections belonging to the requesting user that contain this entity
          userCollections: sql<string>`
            json_group_array(
              json_object('id', ${collections.id}, 'title', ${collections.title})
            ) FILTER (WHERE ${collections.id} IS NOT NULL)
          `.as("user_collections"),
        })
        .from(entities)
        .leftJoin(
          collectionEntities,
          eq(collectionEntities.entityId, entities.id)
        )
        .leftJoin(
          collections,
          and(
            eq(collections.id, collectionEntities.collectionId),
            eq(collections.userId, requestingUserId)  
          )
        )
        .groupBy(entities.id)                        
        .orderBy(desc(entities.createdAt))
        .limit(limit)
        .offset(offset);
    
      return rows.map((row) => ({
        ...row,
        userCollections: JSON.parse(row.userCollections) as { id: string; title: string }[],
      }));
    } catch (e: any) {
      reportError(e);
      throw new InternalError();
    }
  }
  
  
  async findEntitiesByCollection(
    collectionId: string,
    limit: number,
    offset: number
  ): Promise<FindEntitiesByCollectionResult[]> {
    try {
      const result = await db
        .select({
          id: entities.id,
          name: entities.name,
          imageUrl: entities.imageUrl,
          category: entities.category,
          addedAt: collectionEntities.addedAt,
          note: collectionEntities.note,
          latitude: entities.latitude,
          longitude: entities.longitude
        })
        .from(collectionEntities)
        .innerJoin(
          entities,
          eq(entities.id, collectionEntities.entityId)
        )
        .where(eq(collectionEntities.collectionId, collectionId))
        .orderBy(desc(collectionEntities.addedAt))
        .limit(limit)
        .offset(offset);
    
      return result;
    } catch (e: any) {
      reportError(e);
      throw new InternalError();
    }
  }
  
  async countEntities(): Promise<number> {
    const result = await db.select({ count: count() }).from(entities);
    return result[0].count;
  }

  async update(id: string, data: Partial<Omit<Collection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
    try {
      const result = await db.update(collections)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(collections.id, id))
        .returning();
      return result[0];
    } catch (e: any) {
      reportError(e);
      throw new InternalError();
    }
  }

  async delete(id: string): Promise<void> {
    try{
      await db.delete(collections).where(eq(collections.id, id));
    } catch (e: any) {
      reportError(e);
      throw new InternalError();
    }
  }

  //  Collection Entities
  async addEntity(collectionId: string, entityId: string, note ?: string | null) {
  try{
      await db.insert(collectionEntities).values({
        collectionId,
        entityId,
        note: note ?? null,
      }).onConflictDoNothing(); // ignore duplicate
    } catch (e: any) {
      reportError(e);
      throw new InternalError();
    }
  }

  async removeEntity(collectionId: string, entityId: string): Promise<void> {
    await db.delete(collectionEntities).where(
      and(
        eq(collectionEntities.collectionId, collectionId),
        eq(collectionEntities.entityId, entityId)
      )
    );
  }

  async countCollectionEntities(collectionId: string): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(collectionEntities)
      .where(eq(collectionEntities.collectionId, collectionId));
    return result.count;
  }

  async isEntityInCollection(collectionId: string, entityId: string): Promise<boolean> {
    const result = await db.select().from(collectionEntities).where(
      and(
        eq(collectionEntities.collectionId, collectionId),
        eq(collectionEntities.entityId, entityId)
      )
    ).limit(1);
    return result.length > 0;
  }

  // Public collections of a user 
  async findPublicByUserId(userId: string, limit: number, offset: number): Promise<Collection[]> {
    return await db.select()
      .from(collections)
      .where(and(eq(collections.userId, userId), eq(collections.isPublic, true)))
      .orderBy(desc(collections.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async countPublicByUserId(userId: string): Promise<number> {
    const result = await db.select({ count: count() }).from(collections)
      .where(and(eq(collections.userId, userId), eq(collections.isPublic, true)));
    return result[0].count;
  }
}
