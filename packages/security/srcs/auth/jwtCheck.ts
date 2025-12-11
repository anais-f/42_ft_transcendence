import '@fastify/jwt'
import '../fastify.js'
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
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

			// Skip session validation if session_id is not in token (backward compatibility)
			if (sessionId === undefined) {
				done()
				return
			}

			try {
				const authServiceUrl = process.env.AUTH_SERVICE_URL
				const internalSecret = process.env.INTERNAL_API_SECRET

				if (!authServiceUrl || !internalSecret) {
					console.error(
						'AUTH_SERVICE_URL or INTERNAL_API_SECRET not configured'
					)
					void reply.code(503).send({
						success: false,
						error: 'Service configuration error'
					})
					done()
					return
				}

				const response = await fetch(
					`${authServiceUrl}/api/internal/validate-session`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-Internal-Secret': internalSecret
						},
						body: JSON.stringify({ user_id: userId, session_id: sessionId })
					}
				)

				if (!response.ok) {
					void reply.code(401).send({
						success: false,
						error: 'Session expired or invalid'
					})
					done()
					return
				}

				done()
			} catch (error) {
				console.error('Session validation failed:', error)
				void reply.code(503).send({
					success: false,
					error: 'Service unavailable'
				})
				done()
			}
		})
		.catch((err: Error) => {
			console.error('JWT verification failed:', err.message)
			void reply.code(401).send({
				success: false,
				error: 'Unauthorized'
			})
			done()
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
			void reply.code(401).send({
				success: false,
				error: 'Unauthorized'
			})
			return done()
		}

		const userId = Number(request.user?.user_id)
		const paramId = Number(request.params.id)

		if (Number.isNaN(userId) || userId !== paramId) {
			void reply.code(403).send({
				success: false,
				error: 'Forbidden'
			})
			return done()
		}

		return done()
	})
}
