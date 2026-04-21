// review-service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { appError } from "../utils/app-error";
import { hashPassword, verifyPassword } from "../utils/hash";
import zxcvbn from "zxcvbn";
import { CreateReviewService } from "./review-service";

// Mock external modules
vi.mock("../utils/hash", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("zxcvbn", () => ({
  default: vi.fn(),
}));

vi.mock("../utils/app-error", () => ({
  appError: vi.fn((code) => {
    const error = new Error(code);
    (error as any).code = code;
    return error;
  }),
}));

describe("createReviewService", () => {
  let mockRepo: any;
  let service: CreateReviewService;
  
  beforeEach(() => {
    vi.clearAllMocks();

    // Default repository mock
    mockRepo = {
      findUserByEmail: vi.fn(),
      createUser: vi.fn(),
      findEntityById: vi.fn(),
      findAllReviews: vi.fn(),
      createOrUpdateReview: vi.fn(),
      updateEntityRating: vi.fn(),
      findReviewById: vi.fn(),
      userHasPermission: vi.fn(),
      deleteReview: vi.fn(),
      tx: vi.fn((callback) => callback(mockRepo)), // simple transaction mock
    };

    service = new CreateReviewService(mockRepo);
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      const email = "Test@Example.com";
      const password = "StrongPass123!";
      const name = "Test User";
      const hashed = "hashed_password";
      const existingUser = undefined;
      const createdUser = {
        id: 1,
        email: "test@example.com",
        userName: "Test User",
        avatarUrl: null,
        passwordHash: hashed,
      };

      mockRepo.findUserByEmail.mockResolvedValue(existingUser);
      (zxcvbn as any).mockReturnValue({ score: 4 });
      (hashPassword as any).mockResolvedValue(hashed);
      mockRepo.createUser.mockResolvedValue(createdUser);

      const result = await service.createUser(email, password, name);

      expect(mockRepo.findUserByEmail).toHaveBeenCalledWith("test@example.com");
      expect(zxcvbn).toHaveBeenCalledWith(password, [
        "test@example.com",
        "Test User",
      ]);
      expect(hashPassword).toHaveBeenCalledWith(password);
      expect(mockRepo.createUser).toHaveBeenCalledWith(
        "test@example.com",
        hashed,
        "Test User",
      );
      expect(result).toEqual({
        id: 1,
        email: "test@example.com",
        userName: "Test User",
        avatarUrl: null,
      });
    });

    it("should throw USER_EXISTS if email already taken", async () => {
      mockRepo.findUserByEmail.mockResolvedValue({
        id: 1,
        email: "test@example.com",
      });

      await expect(
        service.createUser("test@example.com", "pass", "name"),
      ).rejects.toThrow("USER_EXISTS");
      expect(appError).toHaveBeenCalledWith("USER_EXISTS");
      expect(mockRepo.createUser).not.toHaveBeenCalled();
    });

    it("should throw WEAK_PASSWORD if zxcvbn score < 3", async () => {
      mockRepo.findUserByEmail.mockResolvedValue(undefined);
      (zxcvbn as any).mockReturnValue({ score: 2 });

      await expect(
        service.createUser("test@example.com", "weak", "name"),
      ).rejects.toThrow("WEAK_PASSWORD");
      expect(appError).toHaveBeenCalledWith("WEAK_PASSWORD");
      expect(hashPassword).not.toHaveBeenCalled();
    });
  });

  describe("userLogin", () => {
    it("should login successfully with correct credentials", async () => {
      const email = "Test@Example.com";
      const password = "correct";
      const user = {
        id: 1,
        email: "test@example.com",
        userName: "Test",
        avatarUrl: null,
        passwordHash: "hash",
      };

      mockRepo.findUserByEmail.mockResolvedValue(user);
      (verifyPassword as any).mockResolvedValue(true);

      const result = await service.userLogin(email, password);

      expect(mockRepo.findUserByEmail).toHaveBeenCalledWith("test@example.com");
      expect(verifyPassword).toHaveBeenCalledWith(password, "hash");
      expect(result).toEqual({
        id: 1,
        email: "test@example.com",
        userName: "Test",
        avatarUrl: null,
      });
    });

    it("should throw AUTH_INVALID if user not found", async () => {
      mockRepo.findUserByEmail.mockResolvedValue(undefined);

      await expect(
        service.userLogin("test@example.com", "pass"),
      ).rejects.toThrow("AUTH_INVALID");
      expect(appError).toHaveBeenCalledWith("AUTH_INVALID");
    });

    it("should throw AUTH_INVALID if password verification fails", async () => {
      const user = { id: 1, email: "test@example.com", passwordHash: "hash" };
      mockRepo.findUserByEmail.mockResolvedValue(user);
      (verifyPassword as any).mockResolvedValue(false);

      await expect(
        service.userLogin("test@example.com", "wrong"),
      ).rejects.toThrow("AUTH_INVALID");
      expect(appError).toHaveBeenCalledWith("AUTH_INVALID");
    });
  });

  describe("getReviews", () => {
    it("should return reviews and entity stats", async () => {
      const entityId = 1;
      const entity = { id: 1, avgRating: 4.5, reviewCount: 10 };
      const reviewsList = [
        { id: 1, rating: 5, comment: "Great", userName: "User" },
      ];

      mockRepo.findEntityById.mockResolvedValue(entity);
      mockRepo.findAllReviews.mockResolvedValue(reviewsList);

      const result = await service.getReviews(entityId);

      expect(mockRepo.findEntityById).toHaveBeenCalledWith(entityId);
      expect(mockRepo.findAllReviews).toHaveBeenCalledWith(entityId);
      expect(result).toEqual({
        reviews: reviewsList,
        averageRating: 4.5,
        totalCount: 10,
      });
    });

    it("should throw UNKNOWN_ENTITY if entity not found", async () => {
      mockRepo.findEntityById.mockResolvedValue(undefined);

      await expect(service.getReviews(999)).rejects.toThrow("UNKNOWN_ENTITY");
      expect(appError).toHaveBeenCalledWith("UNKNOWN_ENTITY");
    });
  });

  describe("saveReview", () => {
    it("should save review and update entity rating within transaction", async () => {
      const reviewInput = {
        entityId: 1,
        userId: 10,
        rating: 4,
        comment: "  Good  ",
      };
      const existingEntity = { id: 1, avgRating: 0, reviewCount: 0 };
      const updatedReview = { id: 100, ...reviewInput, comment: "Good" };
      const allReviews = [{ rating: 5 }, { rating: 3 }];
      const updatedEntity = { id: 1, avgRating: 4, reviewCount: 2 };

      mockRepo.findEntityById.mockResolvedValue(existingEntity);
      mockRepo.createOrUpdateReview.mockResolvedValue(updatedReview);
      mockRepo.findAllReviews.mockResolvedValue(allReviews);
      mockRepo.updateEntityRating.mockResolvedValue(updatedEntity);
      // Transaction mock: just calls callback with tx = mockRepo (or any)
      mockRepo.tx.mockImplementation(async (cb: any) => cb(mockRepo));

      const result = await service.saveReview(reviewInput);

      expect(mockRepo.findEntityById).toHaveBeenCalledWith(1);
      expect(mockRepo.createOrUpdateReview).toHaveBeenCalledWith(
        { ...reviewInput, comment: "Good" },
        mockRepo, // transaction object
      );
      expect(mockRepo.findAllReviews).toHaveBeenCalledWith(1);
      expect(mockRepo.updateEntityRating).toHaveBeenCalledWith(
        1,
        4,
        2,
        mockRepo,
      );
      expect(result).toEqual(updatedEntity);
    });

    it("should throw UNKNOWN_ENTITY if entity does not exist", async () => {
      mockRepo.findEntityById.mockResolvedValue(undefined);

      await expect(
        service.saveReview({
          entityId: 999,
          userId: 1,
          rating: 5,
          comment: "",
        }),
      ).rejects.toThrow("UNKNOWN_ENTITY");
      expect(appError).toHaveBeenCalledWith("UNKNOWN_ENTITY");
    });
  });

  describe("deleteReview", () => {
    it("should allow owner to delete review", async () => {
      const reviewId = 1;
      const userId = 10;
      const review = { id: 1, userId: 10 };

      mockRepo.findReviewById.mockResolvedValue(review);
      mockRepo.userHasPermission.mockResolvedValue(false); // not an admin
      mockRepo.deleteReview.mockResolvedValue(undefined);

      await service.deleteReview(reviewId, userId);

      expect(mockRepo.findReviewById).toHaveBeenCalledWith(reviewId);
      expect(mockRepo.userHasPermission).toHaveBeenCalledWith(
        userId,
        "reviews:delete",
      );
      expect(mockRepo.deleteReview).toHaveBeenCalledWith(reviewId);
    });

    it("should allow user with reviews:delete permission to delete (even if not owner)", async () => {
      const reviewId = 2;
      const userId = 20;
      const review = { id: 2, userId: 30 }; // different owner

      mockRepo.findReviewById.mockResolvedValue(review);
      mockRepo.userHasPermission.mockResolvedValue(true); // has permission
      mockRepo.deleteReview.mockResolvedValue(undefined);

      await service.deleteReview(reviewId, userId);

      expect(mockRepo.userHasPermission).toHaveBeenCalledWith(
        userId,
        "reviews:delete",
      );
      expect(mockRepo.deleteReview).toHaveBeenCalledWith(reviewId);
    });

    it("should throw FORBIDDEN if not owner and no permission", async () => {
      const reviewId = 3;
      const userId = 40;
      const review = { id: 3, userId: 50 };

      mockRepo.findReviewById.mockResolvedValue(review);
      mockRepo.userHasPermission.mockResolvedValue(false);

      await expect(service.deleteReview(reviewId, userId)).rejects.toThrow(
        "FORBIDDEN",
      );
      expect(appError).toHaveBeenCalledWith("FORBIDDEN");
      expect(mockRepo.deleteReview).not.toHaveBeenCalled();
    });

    it("should throw NOT_FOUND if review does not exist", async () => {
      mockRepo.findReviewById.mockResolvedValue(undefined);

      await expect(service.deleteReview(999, 1)).rejects.toThrow("NOT_FOUND");
      expect(appError).toHaveBeenCalledWith("NOT_FOUND");
      expect(mockRepo.deleteReview).not.toHaveBeenCalled();
    });
  });
});
