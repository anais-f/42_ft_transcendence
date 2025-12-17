import { FastifyRequest, FastifyReply } from 'fastify'
import { requestGame } from '../../usecases/managers/gameManager/requestGame.js'
import { withGameError } from '../../usecases/managers/gameManager/errors/withGameError.js'
import { PublicUserAuthSchema } from '@ft_transcendence/common'

export async function createNewGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = PublicUserAuthSchema.strip().parse(request.user)
	const gameCode = withGameError(() => requestGame(user.user_id, undefined))

	reply.code(201).send({ code: gameCode })
}
