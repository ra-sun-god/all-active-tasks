import { CreateReviewRepository } from './review-repository';
import {
  Transaction,
  User,
  ReviewWithUser,
  Entity,
  Review,
  ReviewInput,
} from './review-types';
import { AsyncLocalStorage } from 'async_hooks';

export class CreateCachedReviewRepository  {
  
  private transactionALS = new AsyncLocalStorage<boolean>();

  constructor(
    private baseRepo: CreateReviewRepository,
    private redis: any
  ) {}

  // cache keys
  private keys = {
    review: (id: number) => `review:${id}`,
    entity: (id: number) => `entity:${id}`,
    userByEmail: (email: string) => `user:email:${email.toLowerCase()}`,
    reviewsList: (entityId: number) => `reviews:list:${entityId}`,
  };

  // Cache helper
  private async cacheGet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 300
  ): Promise<T> {
    // Skip cache if inside transaction
    if (this.transactionALS.getStore()) {
      return fetcher();
    }

    const cached = await this.redis.get(key);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }

    const data = await fetcher();

    if (data !== undefined) {
      await this.redis.setEx(key, ttl, JSON.stringify(data));
    }

    return data;
  }

  // Invalidate cache
  async cacheInvalidate(keyOrPattern: string) {
    const hasWildcard =
      keyOrPattern.includes('*') || keyOrPattern.includes('?');

    if (!hasWildcard) {
      await this.redis.del(keyOrPattern);
      return;
    }

    let cursor = 0;
    do {
      const reply = await this.redis.scan(String(cursor), {
        MATCH: keyOrPattern,
        COUNT: 100,
      });

      cursor = reply.cursor;

      if (reply.keys.length) {
        await this.redis.del(reply.keys);
      }
    } while (cursor !== 0);
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.cacheGet(
      this.keys.userByEmail(email),
      () => this.baseRepo.findUserByEmail(email)
    );
  }

  async findReviewById(reviewId: number): Promise<Review | undefined> {
    return this.cacheGet(
      this.keys.review(reviewId),
      () => this.baseRepo.findReviewById(reviewId)
    );
  }

  async deleteReview(
    reviewId: number
  ): Promise<number | null | undefined> {
    const review = await this.findReviewById(reviewId);

    if (!review) return null;

    const affectedId = await this.baseRepo.deleteReview(reviewId);

    await this.redis.del(this.keys.entity(reviewId));
    await this.redis.del(this.keys.reviewsList(review.entityId));
    await this.redis.del(this.keys.entity(review.entityId));

    return affectedId;
  }

  async findAllReviews(entityId: number): Promise<ReviewWithUser[]> {
    return this.cacheGet(
      this.keys.reviewsList(entityId),
      () => this.baseRepo.findAllReviews(entityId)
    );
  }

  async createUser(
    email: string,
    passwordHash: string,
    name: string
  ): Promise<User> {
    const user = await this.baseRepo.createUser(
      email,
      passwordHash,
      name
    );

    await this.redis.del(this.keys.userByEmail(email));

    return user;
  }

  async createOrUpdateReview(
    review: ReviewInput,
    tx?: Transaction
  ): Promise<Review> {
    const result = await this.baseRepo.createOrUpdateReview(review, tx);

    await this.redis.del(this.keys.reviewsList(review.entityId));
    await this.redis.del(this.keys.entity(review.entityId));

    return result;
  }

  async findEntityById(id: number): Promise<Entity | undefined> {
    return this.cacheGet(
      this.keys.entity(id),
      () => this.baseRepo.findEntityById(id)
    );
  }

  async updateEntityRating(
    entityId: number,
    avgRating: number,
    reviewsCount: number,
    tx?: Transaction
  ): Promise<Entity> {
    const result = await this.baseRepo.updateEntityRating(
      entityId,
      avgRating,
      reviewsCount,
      tx
    );

    await this.redis.del(this.keys.entity(entityId));

    return result;
  }

  async userHasPermission(
    userId: number,
    permissionName: string
  ): Promise<boolean> {
    return this.baseRepo.userHasPermission(userId, permissionName);
  }

  // Transaction wrapper
  async tx<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.transactionALS.run(true, async () => {
      return this.baseRepo.tx(callback);
    });
  }
}
