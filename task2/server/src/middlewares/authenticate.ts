import { FastifyReply } from "fastify/types/reply"
import { FastifyRequest } from "fastify/types/request"

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  if (!req.session.user) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
}
