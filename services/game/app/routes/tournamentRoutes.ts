import { FastifyInstance } from 'fastify'
import { CreateTournamentSchema } from '@ft_transcendence/common'
import {
	CodeParamSchema,
	CreateTournamentResponseSchema,
	GetTournamentResponseSchema,
	JoinTournamentResponseSchema
} from '@ft_transcendence/common'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import {
	createTournamentController,
	getTournamentController,
	joinTournamentController,
	quitTournamentController
} from '../controllers/tournament/tournamentControllers.js'

export function tournamentRoutes(app: FastifyInstance) {
	app.post(
		'/api/game/createTournament',
		{
			schema: {
				body: CreateTournamentSchema,
				response: {
					200: CreateTournamentResponseSchema
				}
			},
			preHandler: jwtAuthMiddleware
		},
		createTournamentController
	)
	app.post(
		'/api/game/joinTournament/:code',
		{
			schema: {
				params: CodeParamSchema,
				response: {
					200: JoinTournamentResponseSchema
				}
			},
			preHandler: jwtAuthMiddleware
		},
		joinTournamentController
	)
	app.get(
		'/api/game/tournament/:code',
		{
			schema: {
				params: CodeParamSchema,
				response: {
					200: GetTournamentResponseSchema
				}
			},
			preHandler: jwtAuthMiddleware
		},
		getTournamentController
	)
	app.delete(
		'/api/game/quitTournament/:code',
		{
			schema: {
				params: CodeParamSchema
			},
			preHandler: jwtAuthMiddleware
		},
		quitTournamentController
	)
}
