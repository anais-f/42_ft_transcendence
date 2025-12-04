import { FastifyRequest, FastifyReply } from 'fastify'
import { createWsToken } from './createWsToken.js'
import { ERROR_MESSAGES } from  '@ft_transcendence/common'

export async function createTokenController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = request.user as { user_id: number; login: string }
	if (!user) {
		reply
			.status(401)
			.send({ sucess: false, error: ERROR_MESSAGES.UNAUTHORIZED })
		return
	}

	reply.send(createWsToken(request.server, user))
}
