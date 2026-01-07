import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import createHttpError from 'http-errors'

export function apiKeyMiddleware(
	request: FastifyRequest,
	reply: FastifyReply,
	done: HookHandlerDoneFunction
): void {
	const rawAuth = (request.headers.authorization ??
		request.headers['x-api-key']) as string | string[] | undefined

	const apiKey = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth

	if (!apiKey || apiKey !== process.env.INTERNAL_API_SECRET) {
		done(createHttpError.Unauthorized('Unauthorized'))
		return
	}

	done()
}
