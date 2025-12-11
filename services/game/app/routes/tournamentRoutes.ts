import { FastifyInstance } from 'fastify'
import { CreateTournamentSchema } from '@ft_transcendence/common'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import {
	createTournamentController,
	getTournamentController,
	joinTournamentController
} from '../controllers/tournament/tournamentControllers.js'

export function tournamentRoutes(app: FastifyInstance) {
	app.post(
		'/api/createTournament',
		{
			schema: {
				body: CreateTournamentSchema
			},
			preHandler: jwtAuthMiddleware
		},
		createTournamentController
	)
	app.post(
		'/api/joinTournament/:code',
		{
			preHandler: jwtAuthMiddleware
		},
		joinTournamentController
	)
	app.get(
		'/api/tournament/:code',
		{ preHandler: jwtAuthMiddleware },
		getTournamentController
	)
}
