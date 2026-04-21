import { Type, Static } from '@sinclair/typebox';

// shared schemas

// collectionI
const UUIDSchema = Type.String({ format: 'uuid' });

const PaginationQuerySchema = Type.Object({
  limit: Type.Optional(
    Type.Integer({ minimum: 1, maximum: 100, default: 20 })
  ),
  offset: Type.Optional(
    Type.Integer({ minimum: 0, default: 0 })
  ),
});


export const CreateOrUpdateCollectionInput = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  isPublic: Type.Optional(Type.Boolean()),
})
// end shared schemas

// auth res schema 
export const AuthenticatedResponse = Type.Object({
  id: UUIDSchema,
  email: Type.String({ format: 'email' }),
  name: Type.String()
});
//end auth res schema 

//login schema 
export const LoginSchema = {
  body: Type.Object({
    email: Type.String(),
    password: Type.String()
  }),
  response: {
    200: AuthenticatedResponse
  }
}

export type LoginSchemaType = {
  Body: Static<typeof LoginSchema.body>
}
// end login schema 


// signup schema 
export const SignupSchema = {
  body: Type.Object({
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 6 })
  }),
  response: {
    201: AuthenticatedResponse
  }
}

export type SignupSchemaType = {
  Body: Static<typeof SignupSchema.body>;
}

// end signup schema

// collections schema 
export const CollectionsSchema = {
  querystring: PaginationQuerySchema, // note: lowercase 's'
};

export type CollectionsType = {
  Querystring: Static<typeof CollectionsSchema.querystring>;
};
// end collectios schema 

// collections schema 
export const EntitiesSchema = {
  querystring: PaginationQuerySchema, // note: lowercase 's'
};

export type EntitiesSchemaType = {
  Querystring: Static<typeof EntitiesSchema.querystring>;
};
// end collectios schema 


// collection schema 
export const CollectionSchema = {
  params: Type.Object({
    id: UUIDSchema,
  })
};

export type CollectionSchemaType = {
  Params: Static<typeof CollectionSchema.params>
}
//end collection schema 

// create collection schema 
export const CreateCollectionSchema = {
  body: CreateOrUpdateCollectionInput
}

export type CreateCollectionSchemaType = {
  Body: Static<typeof CreateCollectionSchema.body>
}
//end create collection schema

// update collection schema 
export const UpdateCollectionSchema = {
  body: CreateOrUpdateCollectionInput,
  params: Type.Object({
    id: UUIDSchema,
  })
}

export type UpdateCollectionSchemaType = {
  Body: Static<typeof UpdateCollectionSchema.body>,
  Params: Static<typeof UpdateCollectionSchema.params>,
}
// end update collection schema 

// delete collection schema 
export const DeleteCollectionSchema = {
  params: Type.Object({
    id: UUIDSchema,
  })
}

export type DeleteCollectionSchemaType = {
  Params: Static<typeof DeleteCollectionSchema.params>,
}
// end delete collection schema 

// add entities 
export const AddEntityToCollectionSchema = {
  params: Type.Object({
    id: UUIDSchema,
  }),
  body: Type.Object({
    entityId: UUIDSchema,
    note: Type.Optional(Type.String()),
  })
}

export type AddEntityToCollectionSchemaType = {
  Params: Static<typeof AddEntityToCollectionSchema.params>,
  Body: Static<typeof AddEntityToCollectionSchema.body>,
}
//add entities 

// start collection entities schema
export const CollectionEntitiesSchema = {
  params: Type.Object({
    id: UUIDSchema,
  }),
  querystring: PaginationQuerySchema
} 

export type CollectionEntitiesSchemaType = {
  Params: Static<typeof CollectionEntitiesSchema.params>,
  Querystring: Static<typeof CollectionEntitiesSchema.querystring>,
}
// end collection entities schema

// delete entity 
export const RemoveEntityFromCollectionSchema = {
  params: Type.Object({
    id: UUIDSchema,
    entityId: UUIDSchema,
  })
}

export type RemoveEntityFromCollectionSchemaType = {
  Params: Static<typeof RemoveEntityFromCollectionSchema.params>,
}
// end delete entity 

// user public collection schema 
export const UserPublicCollectionSchema = {
  querystring: PaginationQuerySchema,
  params: Type.Object({
    userId: UUIDSchema
  })
}

export type UserPublicCollectionSchemaType = {
  Params: Static<typeof DeleteCollectionSchema.params>,
}
// end user public collection schema
