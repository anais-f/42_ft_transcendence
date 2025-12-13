import { FastifyInstance } from 'fastify'
import {
	createTournamentController,
	joinTournamentController,
	getTournamentController,
	quitTournamentController
} from '../controllers/tournamentControllers.js'
import { CreateTournamentSchema } from '@ft_transcendence/common'
import { jwtAuthMiddleware } from '@ft_transcendence/security'

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
	app.delete(
		'/api/quitTournament/:code',
		{ preHandler: jwtAuthMiddleware },
		quitTournamentController
	)
}
