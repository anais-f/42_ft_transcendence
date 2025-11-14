import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import { ERROR_MESSAGES } from '@ft_transcendence/common'

/**
 * @description Check valid API key in headers
 * @use Routes for inter-service communication
 */
export function apiKeyMiddleware(
	request: FastifyRequest,
	reply: FastifyReply,
	done: HookHandlerDoneFunction
): void {
	const rawAuth = (request.headers.authorization ??
		request.headers['x-api-key']) as string | string[] | undefined

	const apiKey = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth

	if (!apiKey || apiKey !== process.env.USERS_API_SECRET) {
		void reply.code(401).send({
			success: false,
			error: ERROR_MESSAGES.UNAUTHORIZED
		})
		return done()
	}

	return done()
}
