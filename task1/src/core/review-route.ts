import { FastifyInstance } from "fastify";
import {
  CreateReviewSchema,
  CreateReviewSchemaType,
  DeleteReviewsSchema,
  DeleteReviewsSchemaType,
  ListReviewsSchema,
  ListReviewsSchemaType,
  LoginSchema,
  LoginSchemaType,
  SignupSchema,
  SignupSchemaType
} from "./typebox-schemas";


export default async function partnerReviewRoutes(app: FastifyInstance) {
  
  app.post<SignupSchemaType>(
    '/api/signup',
    {
      schema: SignupSchema
    },
    async (req, res) => {
      const b = req.body
  
      const user = await app.reviewService.createUser(
        b.email,
        b.password,
        b.name
      )
      
      req.session.user = user;
  
      return res.code(201).send(user)
    }
  )
  
  app.post<LoginSchemaType>(
    '/api/login',
    {
      schema: LoginSchema
    },
    async (req, res) => {
      
      const user = await app.reviewService.userLogin(
        req.body.email,
        req.body.password
      )
  
      req.session.user = user;
  
      return res.code(200).send(user)
    }
  );

  app.get<ListReviewsSchemaType>(
    "/api/partner/:partnerId/reviews",
    {
      schema: ListReviewsSchema
    },
    async (req) => {
      return app.reviewService.getReviews(req.params.partnerId);
    }
  );

  app.post<CreateReviewSchemaType>(
    "/api/partner/:partnerId/reviews",
    {
      schema: CreateReviewSchema,
      preHandler: [app.authenticate]
    },
    async (req) => {
      return app.reviewService.saveReview({
        entityId: req.params.partnerId,
        userId: req.session.user!.id,
        rating: req.body.rating,
        comment: req.body.comment ?? null
      });
    }
  );
  
  app.delete<DeleteReviewsSchemaType>(
    '/api/reviews/:reviewId',
    {
      schema: DeleteReviewsSchema,
      preHandler: app.authenticate
    },
    async (req, reply) => {
      
      const reviewId = req.params.reviewId;
      const userId = req.session.user!.id;
      await app.reviewService.deleteReview(reviewId, userId);
      return reply.code(204).send();
  });
  
}
