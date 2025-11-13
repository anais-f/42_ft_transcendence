import '@fastify/jwt'

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: { user_id: number; login: string }
		user: { user_id: number; login: string }
	}
}

export {}
