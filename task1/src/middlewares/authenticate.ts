import { HookHandlerDoneFunction } from "fastify"
import { FastifyReply } from "fastify/types/reply"
import { FastifyRequest } from "fastify/types/request"

export function authenticate(req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
  if (!req.session.user) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
  
  done()
}
