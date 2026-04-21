import Fastify, { FastifyServerOptions } from 'fastify';
import partnerReviewRoutes from './core/review-route';
import { serverConfig } from './config/server';
import fs from 'fs';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import  { CreateReviewRepository } from './core/review-repository';
import { db } from './db/database';
import { CreateCachedReviewRepository } from './core/cached-review-repository';
import { connectRedis, redisClient } from './db/redis'; 
import cookie from '@fastify/cookie';
import session from '@fastify/session';
import { authenticate } from './middlewares/authenticate';
import { CreateReviewService } from './core/review-service';

const {
  host,
  port,
  sslCert,
  sslKey,
  sessionSecret
} = serverConfig;

const fastOpts: FastifyServerOptions = {
  logger: true,
  ...(sslCert && sslKey && {
    https: {
      cert: fs.readFileSync(sslCert),
      key: fs.readFileSync(sslKey),
    },
  }),
};

async function startServer() {

  const useCache = process.env.USE_CACHE === 'true';

  if (useCache) {
    await connectRedis();
  }

  const app = Fastify(fastOpts).withTypeProvider<TypeBoxTypeProvider>();
  
  const baseRepo = new CreateReviewRepository(db);
  
  const repo = useCache
    ? new CreateCachedReviewRepository(baseRepo, redisClient as any)
    : baseRepo
  
  // our decorators
  app.decorate("reviewService", new CreateReviewService(repo));
  app.decorate("authenticate", authenticate);

  await app.register(cookie);
  await app.register(session, {
    secret: sessionSecret,
    cookie: {
      secure: false, // true in production (HTTPS)
    },
  });

  await partnerReviewRoutes(app);

  app.listen({ host, port }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Server listening at ${address}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
