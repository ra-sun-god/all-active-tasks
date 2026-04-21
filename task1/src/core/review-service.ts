import { appError } from "../utils/app-error";
import { hashPassword, verifyPassword } from "../utils/hash";
import { CreateCachedReviewRepository } from "./cached-review-repository";
import { CreateReviewRepository } from "./review-repository";
import {
  Entity,
  GetReviews,
  ReviewInput,
  Transaction
} from "./review-types";
import zxcvbn from "zxcvbn";

export class CreateReviewService {
  
  constructor(private repo: CreateReviewRepository | CreateCachedReviewRepository) {}

  async createUser(
    email: string,
    password: string,
    name: string
  ): Promise<{
    id: number;
    email: string;
    userName: string;
    avatarUrl: string | null;
  }> {
    email = email.toLowerCase().trim();
    name = name.trim();
    password = password.trim();

    const existingUser = await this.repo.findUserByEmail(email);
    if (existingUser) throw appError("USER_EXISTS");

    const result = zxcvbn(password, [email, name]);
    if (result.score < 3) {
      throw appError("WEAK_PASSWORD");
    }

    const hashedPassword = await hashPassword(password);
    const user = await this.repo.createUser(email, hashedPassword, name);

    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      avatarUrl: user.avatarUrl
    };
  }

  async userLogin(
    email: string,
    password: string
  ): Promise<{
    id: number;
    email: string;
    userName: string;
    avatarUrl: string | null;
  }> {
    email = email.toLowerCase().trim();
    password = password.trim();

    const user = await this.repo.findUserByEmail(email);
    const authErr = appError("AUTH_INVALID");

    if (!user) throw authErr;

    const isValidPass = await verifyPassword(password, user.passwordHash);
    if (!isValidPass) throw authErr;

    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      avatarUrl: user.avatarUrl
    };
  }

  async getReviews(entityId: number): Promise<GetReviews> {
    const entity = await this.repo.findEntityById(entityId);
    if (!entity) throw appError("UNKNOWN_ENTITY");

    const reviews = await this.repo.findAllReviews(entityId);

    return {
      reviews,
      averageRating: entity.avgRating,
      totalCount: entity.reviewCount
    };
  }

  async saveReview(review: ReviewInput): Promise<Entity> {
    const existingEntity = await this.repo.findEntityById(review.entityId);
    if (!existingEntity) throw appError("UNKNOWN_ENTITY");

    return this.repo.tx<Entity>(async (tx: Transaction) => {
      review.comment = review?.comment?.trim() ?? null;

      await this.repo.createOrUpdateReview(review, tx);

      const reviews = await this.repo.findAllReviews(review.entityId);

      const avg = reviews.length === 0
          ? 0
          : reviews.reduce<number>((acc, r) => acc + r.rating, 0) / reviews.length;

      return this.repo.updateEntityRating(
        review.entityId,
        avg,
        reviews.length,
        tx
      );
    });
  }

  async deleteReview(reviewId: number, userId: number): Promise<void> {
    const review = await this.repo.findReviewById(reviewId);

    if (!review) {
      throw appError("NOT_FOUND");
    }

    const isOwner = review.userId === userId;

    const hasDeletePermission = await this.repo.userHasPermission(
      userId,
      "reviews:delete"
    );

    if (!isOwner && !hasDeletePermission) {
      throw appError("FORBIDDEN");
    }

    await this.repo.deleteReview(reviewId);
  }
}
