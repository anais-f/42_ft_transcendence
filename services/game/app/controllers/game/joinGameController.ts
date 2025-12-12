import { FastifyRequest, FastifyReply } from 'fastify'
import { createWsToken } from '@ft_transcendence/security'
import { joinGame } from '../../usecases/managers/gameManager/joinGame.js'
import { withGameError } from '../../usecases/managers/gameManager/errors/withGameError.js'
import { CodeParamSchema, PublicUserAuthSchema } from '@ft_transcendence/common'

export async function joinGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = PublicUserAuthSchema.strip().parse(request.user)
	const param = CodeParamSchema.parse(request.params)
	console.log(param)

	withGameError(() => joinGame(param.code, user.user_id))
	const tokenObj = createWsToken(request.server, user)

	reply.code(201).send(tokenObj)
}
