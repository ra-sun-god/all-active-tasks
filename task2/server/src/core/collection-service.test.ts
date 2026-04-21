import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from './collection-errors';
import { CreateCollectionRepository } from './collection-repository';
import { CreateCollectionService } from './collection-service';
import { appConfig } from '../config/app';

describe('CollectionService', () => { 
  let mockRepo: Mocked<CreateCollectionRepository>;
  let service: CreateCollectionService;

  beforeEach(() => {
    mockRepo = {
      // user
      findUserByEmail: vi.fn(),
      createUser: vi.fn(),

      // collections
      countByUserId: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),

      // entities
      findEntities: vi.fn(),
      countEntities: vi.fn(),

      // collection entities
      countCollectionEntities: vi.fn(),
      isEntityInCollection: vi.fn(),
      addEntity: vi.fn(),
      removeEntity: vi.fn(),

      // public
      findPublicByUserId: vi.fn(),
      countPublicByUserId: vi.fn(),

      // others used in service
      findEntitiesByCollection: vi.fn(),
    } as unknown as Mocked<CreateCollectionRepository>;
    
    service = new CreateCollectionService(mockRepo);
  });

  it('should create a collection when under limit', async () => {
    mockRepo.countByUserId.mockResolvedValue(5);

    mockRepo.create.mockResolvedValue({
      id: 'col1',
      userId: 'user1',
      title: 'My List',
      description: null,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createCollection('user1', { title: 'My List' });

    expect(result.title).toBe('My List');

    expect(mockRepo.create).toHaveBeenCalledWith({
      userId: 'user1',
      title: 'My List',
      description: undefined,
      isPublic: undefined,
    });
  });

  it('should throw ValidationError when user exceeds max collections', async () => {
    mockRepo.countByUserId.mockResolvedValue(appConfig.max_collections_per_user);

    await expect(
      service.createCollection('user1', { title: 'Too many' })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw NotFoundError when updating non-existing collection', async () => {
    mockRepo.findById.mockResolvedValue(undefined);

    await expect(
      service.updateCollection('nonexistent', 'user1', { title: 'New' })
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw ForbiddenError when non-owner tries to delete collection', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'col1',
      userId: 'owner1',
      isPublic: false,
    } as any);

    await expect(
      service.deleteCollection('col1', 'wrongUser')
    ).rejects.toThrow(ForbiddenError);
  });

  it('should add entity to collection when under limit and not duplicate', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'col1',
      userId: 'user1',
    } as any);

    mockRepo.countCollectionEntities.mockResolvedValue(10);
    mockRepo.isEntityInCollection.mockResolvedValue(false);

    await service.addToCollection('col1', 'user1', 'entity1');

    expect(mockRepo.addEntity).toHaveBeenCalledWith(
      'col1',
      'entity1',
      undefined
    );
  });

  it('should throw ValidationError when collection is full', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'col1',
      userId: 'user1',
    } as any);

    mockRepo.countCollectionEntities.mockResolvedValue(
      appConfig.max_entities_per_collection
    );

    await expect(
      service.addToCollection('col1', 'user1', 'entity1')
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ConflictError when entity already exists in collection', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'col1',
      userId: 'user1',
    } as any);

    mockRepo.countCollectionEntities.mockResolvedValue(10);
    mockRepo.isEntityInCollection.mockResolvedValue(true);

    await expect(
      service.addToCollection('col1', 'user1', 'entity1')
    ).rejects.toThrow(ConflictError);
  });
});
