import { FastifyInstance } from 'fastify'
import {
	CreateTournamentSchema,
	CodeParamSchema,
	CreateTournamentResponseSchema,
	GetTournamentResponseSchema,
	JoinTournamentResponseSchema,
	HttpErrorSchema
} from '@ft_transcendence/common'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import {
	createTournamentController,
	getTournamentController,
	joinTournamentController,
	quitTournamentController
} from '../controllers/tournament/tournamentControllers.js'
import { z } from 'zod'

export function tournamentRoutes(app: FastifyInstance) {
	app.post(
		'/api/game/createTournament',
		{
			schema: {
				tags: ['tournament'],
				body: CreateTournamentSchema,
				response: {
					200: CreateTournamentResponseSchema,
					400: HttpErrorSchema.meta({
						description: 'Invalid request body'
					}),
					401: HttpErrorSchema.meta({
						description: 'Not authenticated'
					}),
					409: HttpErrorSchema.meta({
						description:
							'User is already in a tournament/User is already in a match'
					})
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
				tags: ['tournament'],
				params: CodeParamSchema,
				response: {
					200: JoinTournamentResponseSchema,
					401: HttpErrorSchema.meta({
						description: 'Not authenticated'
					}),
					404: HttpErrorSchema.meta({
						description: 'Tournament not found'
					}),
					409: HttpErrorSchema.meta({
						description:
							'User is already in a tournament/User is already in a match/Tournament is full/Tournament has already started'
					})
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
				tags: ['tournament', 'info'],
				params: CodeParamSchema,
				response: {
					200: GetTournamentResponseSchema,
					401: HttpErrorSchema.meta({
						description: 'Not authenticated'
					}),
					403: HttpErrorSchema.meta({
						description: 'User is not a participant of this tournament'
					}),
					404: HttpErrorSchema.meta({
						description: 'Tournament not found'
					})
				}
			},
			preHandler: jwtAuthMiddleware
		},
		getTournamentController
	)
	app.delete(
		'/api/game/quitTournament',
		{
			preHandler: jwtAuthMiddleware,
			schema: {
				tags: ['tournament'],
				response: {
					200: z
						.any()
						.meta({ description: 'Successfully quit the tournament' }),
					401: HttpErrorSchema.meta({
						description: 'Not authenticated'
					}),
					404: HttpErrorSchema.meta({
						description: 'User is not in a tournament/Tournament not found'
					}),
					409: HttpErrorSchema.meta({
						description: 'Tournament has already started'
					})
				}
			}
		},
		quitTournamentController
	)
}
