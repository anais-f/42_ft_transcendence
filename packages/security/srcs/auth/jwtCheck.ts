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
		const authHeader = request.headers.authorization

		// Si pas d'header Authorization du tout
		if (!authHeader) {
			void reply.code(401).send({
				success: false,
				error: ERROR_MESSAGES.UNAUTHORIZED
			})
			return done()
		}

		// Vérification du format Bearer et extraction du token
		let token: string
		if (authHeader.startsWith('Bearer ')) {
			token = authHeader.substring(7)
		} else {
			// Si pas de "Bearer ", on assume que c'est le token directement
			token = authHeader
		}

		// Vérification basique de la structure JWT (3 parties séparées par des points)
		const tokenParts = token.split('.')
		if (tokenParts.length !== 3) {
			console.error(
				'Invalid JWT format: token must have 3 parts separated by dots'
			)
			void reply.code(401).send({
				success: false,
				error: ERROR_MESSAGES.UNAUTHORIZED
			})
			return done()
		}

		// Validation basique du format base64url de chaque partie
		try {
			for (let i = 0; i < 3; i++) {
				const part = tokenParts[i]
				if (!part || part.length === 0) {
					throw new Error(`JWT part ${i + 1} is empty`)
				}
				// Vérification que c'est du base64url valide (pas de validation complète, juste format de base)
				if (!/^[A-Za-z0-9_-]+$/.test(part)) {
					throw new Error(
						`JWT part ${i + 1} contains invalid base64url characters`
					)
				}
			}

			// Tentative de décodage basique du header pour vérifier qu'il s'agit d'un JSON valide
			try {
				const headerBase64 = tokenParts[0]
				// Ajout du padding si nécessaire pour base64
				const paddedHeader = headerBase64.padEnd(
					Math.ceil(headerBase64.length / 4) * 4,
					'='
				)
				const headerJson = Buffer.from(paddedHeader, 'base64url').toString(
					'utf8'
				)
				JSON.parse(headerJson) // Vérification que c'est un JSON valide
			} catch (headerError) {
				throw new Error('JWT header is not valid JSON')
			}

			// Tentative de décodage basique du payload
			try {
				const payloadBase64 = tokenParts[1]
				const paddedPayload = payloadBase64.padEnd(
					Math.ceil(payloadBase64.length / 4) * 4,
					'='
				)
				const payloadJson = Buffer.from(paddedPayload, 'base64url').toString(
					'utf8'
				)
				JSON.parse(payloadJson) // Vérification que c'est un JSON valide
			} catch (payloadError) {
				throw new Error('JWT payload is not valid JSON')
			}
		} catch (validationError: any) {
			console.error('JWT format validation error:', validationError.message)
			void reply.code(401).send({
				success: false,
				error: ERROR_MESSAGES.UNAUTHORIZED
			})
			return done()
		}

		// Maintenant qu'on a validé le format, on peut utiliser jwtVerify en toute sécurité
		try {
			request.jwtVerify((err: Error | null) => {
				if (err) {
					console.error('JWT verification error:', err.message)
					void reply.code(401).send({
						success: false,
						error: ERROR_MESSAGES.UNAUTHORIZED
					})
					return done()
				}
				done()
			})
		} catch (jwtError: any) {
			// Cette fois, on capture vraiment toutes les erreurs de @fastify/jwt
			console.error('JWT parsing/verification error caught:', jwtError.message)
			void reply.code(401).send({
				success: false,
				error: ERROR_MESSAGES.UNAUTHORIZED
			})
			return done()
		}
	} catch (err) {
		console.error('Unexpected error in JWT middleware:', err)
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
export function jwtAuthOwnerMiddleware(
	request: FastifyRequest,
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
		// Support both userId and id param names
		const paramId = Number(
			(request.params as any)?.userId || (request.params as any)?.id
		)

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
