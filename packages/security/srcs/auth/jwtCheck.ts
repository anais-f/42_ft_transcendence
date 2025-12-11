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
		.then(async () => {
			const userId = request.user.user_id
			const sessionId = request.user.session_id
			if (sessionId === undefined) {
				done()
			}
			try {
				const authServiceUrl = process.env.AUTH_SERVICE_URL
				const internalSecret = process.env.INTERNAL_API_SECRET

				if (!authServiceUrl || !internalSecret) {
					console.error(
						'AUTH_SERVICE_URL or INTERNAL_API_SECRET not configured'
					)
					throw createHttpError.ServiceUnavailable(
						'Service configuration error'
					)
				}
				const response = await fetch(
					`${authServiceUrl}/api/internal/validate-session`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': internalSecret
						},
						body: JSON.stringify({ user_id: userId, session_id: sessionId })
					}
				)
				if (!response.ok) {
					throw createHttpError.Unauthorized('Session expired or invalid')
				}
				done()
			} catch (error) {
				console.error('Session validation failed:', error)
				throw createHttpError.ServiceUnavailable('Service unavailable')
			}
		})
		.catch((err: Error) => {
			console.error('JWT verification failed:', err.message)
			throw createHttpError.Unauthorized('Unauthorized')
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
			throw createHttpError.Unauthorized('Unauthorized')
		}

		const userId = Number(request.user?.user_id)
		const paramId = Number(request.params.id)

		if (Number.isNaN(userId) || userId !== paramId) {
			throw createHttpError.Forbidden('Forbidden')
		}
		done()
	})
}
