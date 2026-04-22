import { FastifyInstance } from "fastify/types/instance";

export default function handleCSRFValidation(app: FastifyInstance) {
  app.addHook('onRequest', (req, reply, done) => {
    const method = req.method
  
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return app.csrfProtection(req, reply, done)
    }
  
    done()
  })
}
