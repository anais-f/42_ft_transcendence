import '@fastify/jwt'
import '../fastify.js'
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import { ERROR_MESSAGES } from '@ft_transcendence/common'

/**
 * @description Check valid JWT token
 * @use Routes accessible to authenticated users
 */
export function jwtAuthMiddleware(
	request: FastifyRequest,
	reply: FastifyReply,
	done: HookHandlerDoneFunction
): void {
	try {
		request.jwtVerify((err: Error | null) => {
			if (err) {
				void reply.code(401).send({
					success: false,
					error: ERROR_MESSAGES.UNAUTHORIZED
				})
				return done()
			}
			done()
		})
	} catch (err) {
		void reply.code(401).send({
			success: false,
			error: ERROR_MESSAGES.UNAUTHORIZED
		})
	}
}

/**
 * @description Check valid JWT token and ownership
 * @use Routes where users can access and modify only their own resources
 */
export function jwtAuthOwnerMiddleware(
	request: FastifyRequest<{ Params: { userId: number } }>,
	reply: FastifyReply,
	done: HookHandlerDoneFunction
): void {
	request.jwtVerify((err: Error | null) => {
		if (err) {
			void reply.code(401).send({
				success: false,
				error: ERROR_MESSAGES.UNAUTHORIZED
			})
			return done()
		}

		const userId = Number(request.user?.user_id)
		const paramId = Number(request.params.userId)

		if (Number.isNaN(userId) || userId !== paramId) {
			void reply.code(403).send({
				success: false,
				error: ERROR_MESSAGES.FORBIDDEN
			})
			return done()
		}

		return done()
	})
}
