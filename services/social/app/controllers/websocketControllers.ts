import { FastifyRequest, FastifyReply } from 'fastify'

export async function createTokenController(
	request: FastifyRequest, reply: FastifyReply
): Promise<{ wsToken: string; expiresIn: number }> {
  const fastify = request.server as any
  const user = request.user as { user_id: number; login: string }
  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

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
