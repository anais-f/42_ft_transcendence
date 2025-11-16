import { FastifyRequest } from 'fastify'

export async function createTokenController(
	request: FastifyRequest
): Promise<{ wsToken: string; expiresIn: number }> {
	const user = request.user as { user_id: number; login: string }

	const payload = {
		user_id: user.user_id,
		login: user.login
	}

	const fastify = request.server as any
	const wsToken = fastify.jwt.sign(payload, {
		expiresIn: '30s'
	})

	return {
		wsToken,
		expiresIn: 30
	}
}
