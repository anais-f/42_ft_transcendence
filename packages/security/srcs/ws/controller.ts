import { FastifyRequest, FastifyReply } from 'fastify'
import { FastifyInstance } from 'fastify'
import { createWsToken } from './createWsToken.js'

export async function createTokenController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = request.user as { user_id: number; login: string }
	if (!user) {
		reply.status(401).send({ Error: 'Unauthorized' })
		return
	}

	const { wsToken, expiresIn } = createWsToken(request.server, user)

	reply.send({ wsToken, expiresIn })
}
