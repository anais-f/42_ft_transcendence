import { FastifyRequest, FastifyReply } from 'fastify'
import { getAssignedGameCode } from '../../usecases/managers/gameManager/getAssignedGameCode.js'
import { withGameError } from '../../usecases/managers/gameManager/errors/withGameError.js'
import { PublicUserAuthSchema } from '@ft_transcendence/common'

export async function getAssignedGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = PublicUserAuthSchema.strip().parse(request.user)

	const code = withGameError(() => getAssignedGameCode(user.user_id))

	reply.code(200).send({ code })
}
