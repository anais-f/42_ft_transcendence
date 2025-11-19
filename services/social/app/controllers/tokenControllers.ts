import { FastifyRequest, FastifyReply } from 'fastify'
import { createWsToken } from '../usescases/tokenService.js'

export async function createTokenController(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const user = request.user as { user_id: number; login: string }
  if (!user) {
    reply.status(401).send({ error: 'Unauthorized' })
    return
  }

  const { wsToken, expiresIn } = createWsToken(request.server, user)

  reply.send({
    wsToken,
    expiresIn
  })
}
