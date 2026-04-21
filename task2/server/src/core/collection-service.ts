import zxcvbn from 'zxcvbn';
import { appConfig } from '../config/app';
import { Collection, CreateCollectionInput, Entity, FindEntitiesByCollectionResult } from '../types';
import { hashPassword, verifyPassword } from '../utils/hash';
import {
  ConflictError,
  ForbiddenError,
  InvalidCredentialsError,
  NotFoundError,
  UserAlreadyExistsError,
  ValidationError,
  WeakPasswordError
} from './collection-errors';
import { CreateCollectionRepository } from './collection-repository';


export class CreateCollectionService {

  constructor(private repo: CreateCollectionRepository) { }

  async createUser(
    email: string,
    password: string,
    name: string
  ): Promise<{
    id: string;
    email: string;
    name: string;
  }> {
    email = email.toLowerCase().trim();
    name = name.trim();
    password = password.trim();

    const existingUser = await this.repo.findUserByEmail(email);
    if (existingUser) throw new UserAlreadyExistsError("User already exists");

    const result = zxcvbn(password, [email, name]);

    if (result.score < 3) {
      throw new WeakPasswordError("The password is weak")
    }

    const hashedPassword = await hashPassword(password);
    const user = await this.repo.createUser(email, hashedPassword, name);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async userLogin(
    email: string,
    password: string
  ): Promise<{
    id: string;
    email: string;
    name: string;
  }> {
    email = email.toLowerCase().trim();
    password = password.trim();

    const user = await this.repo.findUserByEmail(email);
    const authErr = new InvalidCredentialsError("Invalid email or password")

    if (!user) throw authErr;

    const isValidPass = await verifyPassword(password, user.passwordHash);
    if (!isValidPass) throw authErr;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async getUser(email: string): Promise<{ id: string; email: string; name: string } | null> {
    const user = await this.repo.findUserByEmail(email);
    if (!user) throw new NotFoundError('User');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async createCollection(userId: string, input: CreateCollectionInput): Promise<Collection> {

    const userCollectionCount = await this.repo.countByUserId(userId);

    if (userCollectionCount >= appConfig.max_collections_per_user) {
      throw new ValidationError(`User already has maximum ${appConfig.max_collections_per_user} collections`);
    }

    return await this.repo.create({ userId, ...input });
  }

  async getUserCollections(userId: string, limit: number, offset: number): Promise<{ collections: Collection[]; total: number }> {
    const collections = await this.repo.findByUserId(userId, limit, offset);
    const total = await this.repo.countByUserId(userId);
    return { collections, total };
  }
  
  async getEntities(requestingUserId: string, limit: number, offset: number): Promise<{ entities: Entity[]; total: number }> {
    const entities = await this.repo.findEntities(requestingUserId, limit, offset);
    const total = await this.repo.countEntities();
    return { entities, total };
  }

  async getCollectionById(collectionId: string, requestingUserId?: string | null): Promise<Collection> {

    const collection = await this.repo.findById(collectionId);

    if (!collection) throw new NotFoundError('Collection');

    // If private and not owner -> forbid
    if (!collection.isPublic && requestingUserId !== collection.userId) {
      throw new ForbiddenError('You do not have access to this collection');
    }

    return collection;
  }
  
  async getCollectionEntities(
    collectionId: string,
    requestingUserId: string | null,
    limit: number,
    offset: number
  ): 
    Promise<{
      total: number,
      entities: FindEntitiesByCollectionResult[]
    }>
  {
    
    const collection = await this.repo.findById(collectionId)
    
    if (!collection) throw new NotFoundError('Collection');
    
    if (!collection.isPublic && requestingUserId != collection.userId) {
      throw new ForbiddenError('You do not have access to this collection');
    }
    
    const totalEntities = await this.repo.countCollectionEntities(collectionId)
    
    if (totalEntities == 0) {
      return { total: 0, entities: [] }
    }
    
    const entities = await this.repo.findEntitiesByCollection(collectionId, limit, offset)
    
    return { total: totalEntities, entities }
  }

  async updateCollection(collectionId: string, userId: string, input: CreateCollectionInput): Promise<Collection> {
    const collection = await this.repo.findById(collectionId);

    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== userId) throw new ForbiddenError('You are not the owner of this collection');

    const updated = await this.repo.update(collectionId, input);
    if (!updated) throw new NotFoundError('Collection'); // should not happen

    return updated;
  }

  async deleteCollection(collectionId: string, userId: string): Promise<void> {
    const collection = await this.repo.findById(collectionId);
    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== userId) throw new ForbiddenError('You are not the owner of this collection');
    await this.repo.delete(collectionId);
  }

  async addToCollection(collectionId: string, userId: string, entityId: string, note?: string | null): Promise<void> {

    const collection = await this.repo.findById(collectionId);

    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== userId) throw new ForbiddenError('You are not the owner of this collection');

    const currentCount = await this.repo.countCollectionEntities(collectionId);
    if (currentCount >= appConfig.max_entities_per_collection) {
      throw new ValidationError(`Collection already has maximum ${appConfig.max_entities_per_collection} entities`);
    }

    const alreadyExists = await this.repo.isEntityInCollection(collectionId, entityId);
    if (alreadyExists) throw new ConflictError('Entity already exists in this collection');

    await this.repo.addEntity(collectionId, entityId, note);
  }
  
 

  async removeFromCollection(collectionId: string, userId: string, entityId: string): Promise<void> {
    const collection = await this.repo.findById(collectionId);
    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== userId) throw new ForbiddenError('You are not the owner of this collection');
    await this.repo.removeEntity(collectionId, entityId);
  }

  async getPublicCollectionsByUser(targetUserId: string, limit: number, offset: number): Promise<{ collections: Collection[]; total: number }> {
    const collections = await this.repo.findPublicByUserId(targetUserId, limit, offset);
    const total = await this.repo.countPublicByUserId(targetUserId);
    return { collections, total };
  }
}
