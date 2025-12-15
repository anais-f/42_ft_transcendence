import { FastifyInstance } from 'fastify'
import {
	createTournamentController,
	joinTournamentController,
	getTournamentController,
	quitTournamentController
} from '../controllers/tournamentControllers.js'
import {
	CreateTournamentSchema,
	CodeParamSchema,
	CreateTournamentResponseSchema,
	GetTournamentResponseSchema,
	JoinTournamentResponseSchema
} from '@ft_transcendence/common'
import { jwtAuthMiddleware } from '@ft_transcendence/security'

export function tournamentRoutes(app: FastifyInstance) {
	app.post(
		'/api/createTournament',
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
		'/api/joinTournament/:code',
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
		'/api/tournament/:code',
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
