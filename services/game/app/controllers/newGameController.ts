import { FastifyRequest, FastifyReply } from 'fastify'
import createHttpError from 'http-errors'
import { requestGame } from '../game/gameManager/requestGame.js'
import { withGameError } from '../utils/errors/withGameError.js'

export async function createNewGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = request.user as { user_id: number; login: string }

	if (!user) {
		throw createHttpError.Unauthorized()
	}

	const gameCode = withGameError(() => {
		return requestGame(user.user_id, undefined)
	})

	reply.code(201).send({ gameCode: gameCode })
}
