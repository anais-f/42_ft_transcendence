import type { FastifyInstance } from 'fastify'
import { authRoutes } from './authRoutes.js'
import { userRoutes } from './userRoutes.js'
import { twoFARoutes } from './2faRoutes.js'

export async function registerRoutes(app: FastifyInstance) {
	await app.register(authRoutes)
	await app.register(userRoutes)
	await app.register(twoFARoutes)
}
