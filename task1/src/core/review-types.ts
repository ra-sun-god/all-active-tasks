import { InferSelectModel } from "drizzle-orm";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import 'fastify'
import { entities, reviews, users } from "../db/schema";
import '@fastify/session'
import { HookHandlerDoneFunction } from "fastify";
import { RedisClientType, RedisDefaultModules, RedisFunctions, RedisScripts } from 'redis';
import { CreateReviewService } from "./review-service";


export interface Transaction extends SQLiteTransaction<any, any, any, any>{}
export type User = InferSelectModel<typeof users>
export type Entity = InferSelectModel<typeof entities>
export type Review = InferSelectModel<typeof reviews>
export type IRedisClient = RedisClientType<RedisDefaultModules, RedisFunctions, RedisScripts>;

export interface ReviewWithUser {
  id: number;
  rating: number;
  comment: string | null;
  userName: string | null;  
  userAvatar: string | null;
  createdAt: Date;   
  updatedAt?: Date;
}

export interface ReviewInput {
  rating: number;
  comment: string | null;
  userId: number;
  entityId: number;
}

export interface GetReviews {
  averageRating: number;
  totalCount: number;
  reviews: ReviewWithUser[]
}


declare module 'fastify' {
  interface FastifyInstance {
    reviewService: CreateReviewService,
    authenticate: (req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => void;
  }
  
  interface Session {
    user?: {
      id: number
      email: string
      userName: string
    }
  }
}
