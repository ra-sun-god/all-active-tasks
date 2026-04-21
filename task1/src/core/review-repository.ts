import { LibSQLDatabase } from "drizzle-orm/libsql/driver-core";
import {
  ReviewWithUser,
  Entity,
  ReviewInput,
  Review,
  Transaction,
  User
} from "./review-types";
import {
  entities,
  permissions,
  reviews,
  rolePermissions,
  userRoles,
  users
} from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { appError } from "../utils/app-error";
import { reportError } from "../utils";

export class CreateReviewRepository {
  constructor(private db: LibSQLDatabase) {}

  async tx<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      return callback(tx);
    });
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      return this.db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .get();
    } catch (e: any) {
      reportError(e);
      throw appError("INTERNAL_ERROR");
    }
  }

  async createUser(
    email: string,
    passwordHash: string,
    name: string
  ): Promise<User> {
    try {
      const [user] = await this.db
        .insert(users)
        .values({
          email,
          passwordHash,
          userName: name
        })
        .returning();

      return user;
    } catch (e: any) {
      reportError(e);
      throw appError("INTERNAL_ERROR");
    }
  }

  async findReviewById(reviewId: number): Promise<Review | undefined> {
    try {
      return this.db
        .select()
        .from(reviews)
        .where(eq(reviews.id, reviewId))
        .get();
    } catch (e: any) {
      reportError(e);
      throw appError("INTERNAL_ERROR");
    }
  }

  async findAllReviews(partnerId: number): Promise<ReviewWithUser[]> {
    try {
      return this.db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          userName: users.userName,
          userAvatar: users.avatarUrl
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.entityId, partnerId))
        .orderBy(desc(reviews.createdAt))
        .all();
    } catch (e: any) {
      reportError(e);
      throw appError("INTERNAL_ERROR");
    }
  }

  async deleteReview(reviewId: number): Promise<number | null | undefined> {
    try {
      const result = await this.db
        .delete(reviews)
        .where(eq(reviews.id, reviewId));

      return result.rowsAffected;
    } catch (e: any) {
      reportError(e);
      throw appError("INTERNAL_ERROR");
    }
  }

  async findEntityById(partnerId: number): Promise<Entity | undefined> {
    try {
      return this.db
        .select()
        .from(entities)
        .where(eq(entities.id, partnerId))
        .get();
    } catch (e: any) {
      reportError(e);
      throw appError("INTERNAL_ERROR");
    }
  }

  async createOrUpdateReview(
    review: ReviewInput,
    tx?: Transaction
  ): Promise<Review> {
    try {
      const [updated] = await (tx ?? this.db)
        .insert(reviews)
        .values(review)
        .onConflictDoUpdate({
          target: [reviews.userId, reviews.entityId],
          set: {
            rating: review.rating,
            comment: review.comment
          }
        })
        .returning();

      return updated;
    } catch (e: any) {
      reportError(e);
      throw appError("INTERNAL_ERROR");
    }
  }

  async updateEntityRating(
    entityId: number,
    avgRating: number,
    reviewsCount: number,
    tx?: Transaction
  ): Promise<Entity> {
    try {
      const result = await (tx ?? this.db)
        .update(entities)
        .set({ avgRating, reviewCount: reviewsCount })
        .where(eq(entities.id, entityId))
        .limit(1)
        .returning();

      return result?.[0];
    } catch (e: any) {
      reportError(e);
      throw appError("INTERNAL_ERROR");
    }
  }

  async userHasPermission(
    userId: number,
    permissionName: string
  ): Promise<boolean> {
    try {
      const result = await this.db
        .select()
        .from(userRoles)
        .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(permissions.name, permissionName)
          )
        )
        .limit(1)
        .get();

      return !!result;
    } catch (e: any) {
      reportError(e);
      throw appError("INTERNAL_ERROR");
    }
  }
}
