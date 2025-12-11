import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'

/**
 * @description Check valid API key in headers for inter-service communication
 * @use Routes for internal service-to-service calls (uses INTERNAL_API_SECRET)
 */
export function apiKeyMiddleware(
	request: FastifyRequest,
	reply: FastifyReply,
	done: HookHandlerDoneFunction
): void {
	const rawAuth = (request.headers.authorization ??
		request.headers['x-api-key']) as string | string[] | undefined

	const apiKey = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth

	if (!apiKey || apiKey !== process.env.INTERNAL_API_SECRET) {
		void reply.code(401).send({
			success: false,
			error: 'Unauthorized'
		})
		return done()
	}

	return done()
}
