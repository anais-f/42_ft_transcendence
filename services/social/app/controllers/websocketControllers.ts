import { FastifyRequest, FastifyReply } from 'fastify'

export async function createTokenController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const fastify = request.server as any
	const user = request.user as { user_id: number; login: string }
	if (!user) {
		reply.status(401).send({ error: 'Unauthorized' })
		return
	}

	const payload = {
		user_id: user.user_id,
		login: user.login
	}

	const wsToken = fastify.jwt.sign(payload, {
		expiresIn: '30s'
	})

	reply.send({
		wsToken,
		expiresIn: 30
	})
}
