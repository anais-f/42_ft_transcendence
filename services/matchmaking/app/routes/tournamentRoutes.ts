import { FastifyInstance } from 'fastify'
import {
	createTournamentController,
	joinTournamentController,
	removeFromTournamentController,
	startTournamentController,
	getTournamentController,
	deleteTournamentController
} from '../controllers/tournamentControllers.js'
import {
	CreateTournamentSchema,
	RemoveTournamentSchema
} from '@ft_transcendence/common'
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
		'/api/joinTournament/:id',
		{
			preHandler: jwtAuthMiddleware
		},
		joinTournamentController
	)
	app.post(
		'/api/removeFromTournament/:id',
		{
			schema: {
				body: RemoveTournamentSchema
			},
			preHandler: jwtAuthMiddleware
		},
		removeFromTournamentController
	)
	app.get(
		'/api/startTournament/:id' /*, { preHandler: jwtAuthMiddleware }*/,
		startTournamentController
	)
	app.get(
		'/api/tournament/:id' /*, { preHandler: jwtAuthMiddleware }*/,
		getTournamentController
	)
	app.delete(
		'/api/tournament/:id' /*, { preHandler: jwtAuthOwnerMiddleware }*/,
		deleteTournamentController
	)
}
