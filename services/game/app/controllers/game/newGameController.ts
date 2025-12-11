import { FastifyRequest, FastifyReply } from 'fastify'
import createHttpError from 'http-errors'
import { requestGame } from '../../usecases/managers/gameManager/requestGame.js'
import { withGameError } from '../../usecases/managers/gameManager/errors/withGameError.js'

export async function createNewGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = request.user as { user_id: number; login: string }

	// NOTE: idk if it's needed
	if (!user) {
		throw createHttpError.Unauthorized()
	}

	const gameCode = withGameError(() => requestGame(user.user_id, undefined))
	console.log(gameCode)
	reply.code(201).send({ code: gameCode })
}
