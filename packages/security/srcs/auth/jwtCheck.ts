import '@fastify/jwt'
import '../fastify.js'
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import { ERROR_MESSAGES } from '@ft_transcendence/common'

/**
 * @description Check valid JWT token from httpOnly cookie or Authorization header
 * @use Routes accessible to authenticated users
 */
export function jwtAuthMiddleware(
	request: FastifyRequest,
	reply: FastifyReply,
	done: HookHandlerDoneFunction
): void {
	try {
		// if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
		//   console.error('Invalid JWT format')
		//   return reply.code(401).send({
		//     success: false,
		//     error: ERROR_MESSAGES.UNAUTHORIZED
		//   })
		// }
		// // Validation que header et payload sont du JSON valide
		// const parts = token.split('.')
		// try {
		//   // Décoder et parser le header (si malformé = erreur)
		//   const headerJson = Buffer.from(parts[0], 'base64url').toString('utf8')
		//   JSON.parse(headerJson)
		//
		//   // Décoder et parser le payload (si malformé = erreur)
		//   const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8')
		//   JSON.parse(payloadJson)
		// } catch (parseError) {
		//   console.error('Invalid JWT: header or payload is not valid JSON')
		//   return reply.code(401).send({
		//     success: false,
		//     error: ERROR_MESSAGES.UNAUTHORIZED
		//   })
		// }

		request.jwtVerify((err: Error | null) => {
			if (err) {
				console.error('JWT verification failed:', err.message)
				void reply.code(401).send({
					success: false,
					error: ERROR_MESSAGES.UNAUTHORIZED
				})
				return done()
			}
			done()
		})
	} catch (err: any) {
		console.error('Unexpected JWT error:', err.message)
		void reply.code(401).send({
			success: false,
			error: ERROR_MESSAGES.UNAUTHORIZED
		})
		done()
	}
}

/**
 * @description Check valid JWT token and ownership
 * @use Routes where users can access and modify only their own resources
 * @param request FastifyRequest with params containing userId
 */
// export function jwtAuthOwnerMiddleware(
// 	request: FastifyRequest,
// 	reply: FastifyReply,
// 	done: HookHandlerDoneFunction
// ): void {
// 	request.jwtVerify((err: Error | null) => {
// 		if (err) {
// 			void reply.code(401).send({
// 				success: false,
// 				error: ERROR_MESSAGES.UNAUTHORIZED
// 			})
// 			return done()
// 		}
//
// 		const userId = Number(request.user?.user_id)
// 		// Support both userId and id param names
// 		const paramId = Number(
// 			(request.params as any)?.userId || (request.params as any)?.id
// 		)
//
// 		if (Number.isNaN(userId) || userId !== paramId) {
// 			void reply.code(403).send({
// 				success: false,
// 				error: ERROR_MESSAGES.FORBIDDEN
// 			})
// 			return done()
// 		}
//
// 		return done()
// 	})
// }
