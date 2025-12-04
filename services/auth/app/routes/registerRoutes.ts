import type { FastifyInstance } from 'fastify'
import { authRoutes } from './authRoutes.js'
import { userRoutes } from './userRoutes.js'
import { twoFARoutes } from './2faRoutes.js'
import { oauthRoutes } from './oauthRoutes.js'

export async function registerRoutes(app: FastifyInstance) {
	await app.register(authRoutes)
	await app.register(userRoutes)
	await app.register(twoFARoutes)
	await app.register(oauthRoutes)
}
