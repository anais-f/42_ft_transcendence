import '@fastify/jwt'
import '@fastify/cookie'

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: { user_id: number; login: string; session_id: number }
		user: { user_id: number; login: string; session_id: number }
	}
}

declare module 'fastify' {
	interface FastifyRequest {
		cookies: { [cookieName: string]: string | undefined }
	}
}

export {}
