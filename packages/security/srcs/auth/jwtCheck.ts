import '@fastify/jwt'
import '../fastify.js'
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import createHttpError from 'http-errors'
/**
 * @description Check valid JWT token from httpOnly cookie or Authorization header
 * @use Routes accessible to authenticated users
 */
export function jwtAuthMiddleware(
	request: FastifyRequest,
	reply: FastifyReply,
	done: HookHandlerDoneFunction
): void {
	request
		.jwtVerify()
		.then(() => {
			done()
		})
		.catch((err: Error) => {
			console.error('JWT verification failed:', err.message)
			throw createHttpError.Unauthorized()
		})
}

/**
 * @description Check valid JWT token and ownership
 * @use Routes where users can access and modify only their own resources
 */
export function jwtAuthOwnerMiddleware(
	request: FastifyRequest<{ Params: { id: number } }>,
	reply: FastifyReply,
	done: HookHandlerDoneFunction
): void {
	request.jwtVerify((err: Error | null) => {
		if (err) {
			throw createHttpError.Unauthorized()
		}

		const userId = Number(request.user?.user_id)
		const paramId = Number(request.params.id)

		if (Number.isNaN(userId) || userId !== paramId) {
			throw createHttpError.Forbidden()
		}

		return done()
	})
}
