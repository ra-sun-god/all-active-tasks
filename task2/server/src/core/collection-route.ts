import { FastifyInstance } from 'fastify';
import {
  AddEntityToCollectionSchema,
  AddEntityToCollectionSchemaType,
  AuthenticatedResponse,
  CollectionEntitiesSchema,
  CollectionEntitiesSchemaType,
  CollectionSchema,
  CollectionSchemaType,
  CollectionsSchema,
  CollectionsType,
  CreateCollectionSchema,
  CreateCollectionSchemaType,
  DeleteCollectionSchema,
  DeleteCollectionSchemaType,
  EntitiesSchema,
  EntitiesSchemaType,
  LoginSchema,
  LoginSchemaType,
  RemoveEntityFromCollectionSchema,
  RemoveEntityFromCollectionSchemaType,
  SignupSchema,
  SignupSchemaType,
  UpdateCollectionSchema,
  UpdateCollectionSchemaType,
  UserPublicCollectionSchema,
  UserPublicCollectionSchemaType
} from '../types/typebox-schemas';

export async function collectionRoutes(app: FastifyInstance) {
  
  app.get('/api/csrf-token', (request, reply) => {
    const token = reply.generateCsrf()
    reply.send({ csrfToken: token })
  })

  app.post<SignupSchemaType>(
    '/api/signup',
    { schema: SignupSchema },
    async (req, res) => {

      const b = req.body

      const user = await app.collectionService.createUser(
        b.email,
        b.password,
        b.name
      )

      req.session.user = user;
      await req.session.save();
      
      return res.code(201).send(user)
    }
  )

  app.post<LoginSchemaType>(
    '/api/login',
    { schema: LoginSchema },
    async (req, res) => {

      const user = await app.collectionService.userLogin(
        req.body.email,
        req.body.password
      )

      req.session.user = user;
      await req.session.save();
      
      return res.code(200).send(user)
    }
  );

  app.get(
    '/api/me',
    {
      schema: {
        response: {
          200: AuthenticatedResponse
        }
      },
      preHandler: [app.authenticate]
    },
    async (req, res) => {
      const user = await app.collectionService.getUser(req.session.user!.email)
      return res.code(200).send(user)
    }
  );

  app.post(
    '/api/logout',
    { preHandler: [app.authenticate] },
    async (req, res) => {
      req.session.user = undefined;
      req.session.destroy();
      return res.code(200).send()
    }
  );

  // GET /api/collections – list own collections (paginated)
  app.get<CollectionsType>(
    '/api/collections', {
    schema: CollectionsSchema,
    preHandler: [app.authenticate]
  }, async (req) => {

    const { limit = 20, offset = 0 } = req.query;
    const userId = req.session.user!.id;

    return app.collectionService.getUserCollections(userId, limit, offset);
  });

  // POST /api/collections – create collection
  app.post<CreateCollectionSchemaType>(
    '/api/collections', {
    schema: CreateCollectionSchema,
    preHandler: [app.authenticate]
  }, async (req) => {
    const userId = req.session.user!.id;
    const collection = await app.collectionService.createCollection(userId, req.body);
    return collection;
  });

  // GET /api/collections/:id – get collection with entities
  app.get<CollectionSchemaType>(
    '/api/collections/:id', {
    schema: CollectionSchema,
    //preHandler: [app.authenticate]
  }, async (req) => {
    const { id } = req.params;
    const reqUserId = req.session.user?.id;
    const collection = await app.collectionService.getCollectionById(id, reqUserId);
    return collection;
  });

  // PATCH /api/collections/:id – update collection
  app.patch<UpdateCollectionSchemaType>(
    '/api/collections/:id', {
    schema: UpdateCollectionSchema,
    preHandler: [app.authenticate]
  }, async (req) => {
    const { id } = req.params;
    const userId = req.session.user!.id;
    const updated = await app.collectionService.updateCollection(id, userId, req.body);
    return updated;
  });

  // DELETE /api/collections/:id – delete collection
  app.delete<DeleteCollectionSchemaType>(
    '/api/collections/:id', {
    schema: DeleteCollectionSchema,
    preHandler: [app.authenticate]
  }, async (req, reply) => {
    const { id } = req.params;
    const userId = req.session.user!.id;
    await app.collectionService.deleteCollection(id, userId);
    reply.status(204).send();
  });
  
  // GET /api/entities - list entities (paginated)
  app.get<EntitiesSchemaType>(
    '/api/entities', {
    schema: EntitiesSchema,
    preHandler: [app.authenticate]
  }, async (req) => {
    const { limit = 20, offset = 0 } = req.query;
    const requestingUserId = req.session.user!.id;
    return app.collectionService.getEntities(requestingUserId, limit, offset);
  });
  
  // GET /api/collections/:id/entities – get collection entities
  app.get<CollectionEntitiesSchemaType>(
    '/api/collections/:id/entities', {
    schema: CollectionEntitiesSchema,
  }, async (req) => {
    
    const reqUserId = req.session.user?.id; 
    const { id: collectionId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
      
      return app.collectionService.getCollectionEntities(collectionId, reqUserId, limit, offset);
  });


  // POST /api/collections/:id/entities – add entity
  app.post<AddEntityToCollectionSchemaType>(
    '/api/collections/:id/entities', {
    schema: AddEntityToCollectionSchema,
    preHandler: [app.authenticate]
  }, async (req) => {
    const { id } = req.params;
    const { entityId, note } = req.body;
    const userId = req.session.user!.id;
    return app.collectionService.addToCollection(id, userId, entityId, note);
  });

  // DELETE /api/collections/:id/entities/:entityId – remove entity
  app.delete<RemoveEntityFromCollectionSchemaType>(
    '/api/collections/:id/entities/:entityId', {
    schema: RemoveEntityFromCollectionSchema,
    preHandler: [app.authenticate]
  }, async (req, reply) => {
      
     const { id, entityId } = req.params;
     const userId = req.session.user!.id;
   
     await app.collectionService.removeFromCollection(id, userId, entityId);
   
     return reply.code(204).send();
  });

  // GET /api/collections/public/:userId – public collections of a user
  app.get<UserPublicCollectionSchemaType>(
    '/api/collections/public/:userId', {
    schema: UserPublicCollectionSchema
  }, async (request, reply) => {
    const { userId } = request.params as any;
    const { limit = 20, offset = 0 } = request.query as any;
    const result = await app.collectionService.getPublicCollectionsByUser(userId, limit, offset);
    return result;
  });
}
