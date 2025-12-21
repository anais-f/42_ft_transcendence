import { FastifyInstance } from 'fastify'
import { tournamentRoutes } from './tournamentRoutes.js'
import { statsRoutes } from './statsRoutes.js'

export async function registerRoutes(app: FastifyInstance) {
	await app.register(tournamentRoutes)
	await app.register(statsRoutes)
}
