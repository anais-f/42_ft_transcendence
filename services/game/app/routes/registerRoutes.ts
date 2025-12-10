import { FastifyInstance } from 'fastify'
import { tournamentRoutes } from './tournamentRoutes.js'
import { historyRoutes } from './historyRoutes.js'
import { gameRoutes } from './gameRoutes.js'

export async function registerRoutes(app: FastifyInstance) {
	await app.register(tournamentRoutes)
	await app.register(historyRoutes)
	await app.register(gameRoutes)
}
