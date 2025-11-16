import { FastifyRequest } from 'fastify'

export async function createTokenController(request: FastifyRequest): Promise<FastifyReply> {
  const user = request.user

  const payload = {
    user_id: user.user_id,
    login: user.login
  }

  const wsToken = fastify.jwt.sign(payload, {
    expiresIn: '30s'
  })

  return {
    wsToken,
    expiresIn: 30
  }
}


