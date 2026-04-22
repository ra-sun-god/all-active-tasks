import Fastify, { FastifyServerOptions } from 'fastify';
import { serverConfig } from './config/server';
import fs from 'fs';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import cookie from '@fastify/cookie';
import session from '@fastify/session';
//import connectSqlite from 'connect-sqlite3';
import { authenticate } from './middlewares/authenticate';
import { CreateCollectionRepository } from './core/collection-repository';
import { CreateCollectionService } from './core/collection-service';
import cors from '@fastify/cors'
import { collectionRoutes } from './core/collection-route';
import sessionFileStore from 'session-file-store'
import csrf from '@fastify/csrf-protection'
import handleCSRFValidation from './middlewares/csrf';

const isProduction = process.env.NODE_ENV != "development";

console.log("isProduction===>", isProduction)

const {
  host,
  port,
  sslCert,
  sslKey,
  sessionSecret,
  corsOrigins
} = serverConfig;

const fastOpts: FastifyServerOptions = {
  logger: true,
  trustProxy: true,
  ...(sslCert && sslKey && {
    https: {
      cert: fs.readFileSync(sslCert),
      key: fs.readFileSync(sslKey),
    },
  }),
};

async function startServer() {

  const app = Fastify(fastOpts).withTypeProvider<TypeBoxTypeProvider>();
  
  // Register CORS first, before cookie/session
  await app.register(cors, {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  

  
  const collectionRepository = new CreateCollectionRepository()
  const collectionService = new CreateCollectionService(collectionRepository)

  // our decorators
  app.decorate("authenticate", authenticate);
  app.decorate("collectionService", collectionService)
  
  await app.register(cookie);

  // set our sessions database 
  
  const FileStore = sessionFileStore(session as any)
  const store =  new FileStore({
    path: './.database/sessions',
  })

  await app.register(session, {
    secret: sessionSecret,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,      
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',      
      maxAge: 7 * 24 * 60 * 60 * 1000,
     // domain: cookieDomain
    },
    store
  });
  
  app.register(csrf, {
    cookieOpts: {
      signed: false,
    }
  })
  
  
  // handleCSRFValidation
  handleCSRFValidation(app)
  
  // lets register our routes 
  collectionRoutes(app)
  

  app.listen({ host, port }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Server listening at ${address}`);
  });
}// end func

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
