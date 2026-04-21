import { InferSelectModel } from "drizzle-orm";
import { collections } from "../db/schema/collections";
import { entities } from "../db/schema/entities";
import { users } from "../db/schema/users";
import { collectionEntities } from "../db/schema/collection-entities";
import { CreateCollectionService } from "../core/collection-service";


export type User = InferSelectModel<typeof users>
export type Entity = InferSelectModel<typeof entities>
export type Collection = InferSelectModel<typeof collections>
export type CollectionEntities = InferSelectModel<typeof collectionEntities>
export type User = InferSelectModel<typeof users>

export interface CollectionWithEntities extends Collection {
  entities: {
    entityId: string;
    addedAt: Date;
    note: string | null;
  }[];
}

export interface RepoCreate {
  userId: string;
  title: string;
  description?: string | null;
  isPublic?: boolean
}

export interface CreateCollectionInput {
  title: string;
  description?: string;
  isPublic?: boolean
}

export interface FindEntitiesByCollectionResult {
  id: string
  name: string
  imageUrl: string | null
  category: string | null
  addedAt: Date
  note: string | null
  latitude: number | null
  longitude: number | null
}

declare module 'fastify' {
  interface FastifyInstance {
    collectionService: CreateCollectionService,
    authenticate: (req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => void;
  }

  interface Session {
    user?: {
      id: string
      email: string
      name: string
    } | null
  }
}
