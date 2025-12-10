import { FastifyInstance } from 'fastify'
import { tournamentRoutes } from './tournamentRoutes.js'
import { historyRoutes } from './historyRoutes.js'

export async function registerRoutes(app: FastifyInstance) {
	await app.register(tournamentRoutes)
	await app.register(historyRoutes)
}
