import { FastifyRequest, FastifyReply } from 'fastify'
import { requestGame } from '../../usecases/managers/gameManager/requestGame.js'
import { withGameError } from '../../usecases/managers/gameManager/errors/withGameError.js'
import {
	PublicUserAuthSchema,
	CreateGameSchema
} from '@ft_transcendence/common'
import { PaddleShape, ObstacleType } from '@ft_transcendence/pong-shared'
import { usersToTournament } from '../../usecases/managers/gameData.js'
import createHttpError from 'http-errors'

export async function createNewGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = PublicUserAuthSchema.strip().parse(request.user)
	const body = CreateGameSchema.parse(request.body ?? {})

	if (usersToTournament.has(user.user_id)) {
		throw createHttpError.Conflict('player already in a tournament')
	}

	const mapOptions = body.mapOptions
		? {
				paddleShape: body.mapOptions.paddleShape as PaddleShape,
				obstacle: body.mapOptions.obstacle as ObstacleType
			}
		: undefined

	const gameCode = withGameError(() =>
		requestGame(user.user_id, undefined, undefined, mapOptions)
	)

	reply.code(201).send({ code: gameCode })
}
