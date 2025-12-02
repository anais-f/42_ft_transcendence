import '@fastify/jwt'
import '@fastify/cookie'

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: { user_id: number; login: string }
		user: { user_id: number; login: string }
	}
}

declare module 'fastify' {
	interface FastifyRequest {
		cookies: { [cookieName: string]: string | undefined }
	}
}

export {}
