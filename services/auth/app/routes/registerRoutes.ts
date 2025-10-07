import type { FastifyInstance } from 'fastify'
import { authRoutes } from './authRoutes.js'
import { userRoutes } from './userRoutes.js'

export async function registerRoutes(app: FastifyInstance) {
	await app.register(authRoutes)
	await app.register(userRoutes)
	app.get('/health', async () => ({ status: 'ok' }))
}
