
import { Type } from "@sinclair/typebox";
import { Static } from "typebox";


// list reviews schema 
export const ListReviewsSchema = {
  params: Type.Object({
    partnerId: Type.Integer()
  })
}

export type ListReviewsSchemaType = {
  Params: Static<typeof ListReviewsSchema.params>
}
// end list reviews schema 

// create reviews schama
export const CreateReviewSchema = {
  params: Type.Object({
    partnerId: Type.Integer()
  }),
  
  body: Type.Object({
    rating: Type.Integer({ 
      minimum: 1, 
      maximum: 5,
    }),
    comment: Type.Optional(Type.String({ 
      maxLength: 2000,
    }))
  })
}

export type CreateReviewSchemaType = {
  Params: Static<typeof CreateReviewSchema.params>,
  Body: Static<typeof CreateReviewSchema.body>
}

// end create reviews schama

// delete reviews schama
export const DeleteReviewsSchema = {
  params: Type.Object({
    reviewId: Type.Integer()
  })
}

export type DeleteReviewsSchemaType = {
  Params: Static<typeof DeleteReviewsSchema.params>
}

//end delete review schema 

// auth res schema 
const AuthenticatedResponse = Type.Object({
  id: Type.Number(),
  email: Type.String(),
  avatarUrl: Type.String(),
  userName: Type.String()
});
//end auth res schema 

//login schema 
export const LoginSchema = {
  body:  Type.Object({
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
  Body: Static<typeof SignupSchema.body>
}

// end signup schema
