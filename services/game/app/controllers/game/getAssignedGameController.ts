import { FastifyRequest, FastifyReply } from 'fastify'
import * as GameManager from '../../usecases/managers/gameManager/index.js'
import { PublicUserAuthSchema } from '@ft_transcendence/common'

export async function getAssignedGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = PublicUserAuthSchema.strip().parse(request.user)

	const code = GameManager.withGameError(() =>
		GameManager.getAssignedGameCode(user.user_id)
	)

	reply.code(200).send({ code })
}
