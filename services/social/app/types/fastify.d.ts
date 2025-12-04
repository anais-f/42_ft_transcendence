import 'fastify'

declare module 'fastify' {
	interface FastifyRequest {
		user?: {
			user_id: number
			login: string
		}
	}
}
