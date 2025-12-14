import { FastifyInstance } from 'fastify'
import {
	createTournamentController,
	joinTournamentController,
	getTournamentController,
	quitTournamentController
} from '../controllers/tournamentControllers.js'
import { CreateTournamentSchema } from '@ft_transcendence/common'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { CodeParamSchema } from '@ft_transcendence/common'

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
			schema: {
				params: CodeParamSchema
			},
			preHandler: jwtAuthMiddleware
		},
		joinTournamentController
	)
	app.get(
		'/api/tournament/:code',
		{ 
			schema: {
				params: CodeParamSchema
			},
			preHandler: jwtAuthMiddleware
		},
		getTournamentController
	)
	app.delete(
		'/api/quitTournament/:code',
		{ 
			schema: {
				params: CodeParamSchema
			},
			preHandler: jwtAuthMiddleware
		},
		quitTournamentController
	)
}
