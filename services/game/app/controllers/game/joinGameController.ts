import { FastifyRequest, FastifyReply } from 'fastify'
import { createWsToken } from '@ft_transcendence/security'
import * as GameManager from '../../usecases/managers/gameManager/index.js'
import { CodeParamSchema, PublicUserAuthSchema } from '@ft_transcendence/common'

export async function joinGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = PublicUserAuthSchema.strip().parse(request.user)
	const param = CodeParamSchema.parse(request.params)
	console.log(param)

	GameManager.withGameError(() =>
		GameManager.joinGame(param.code, user.user_id)
	)
	const tokenObj = createWsToken(request.server, user)

	reply.code(201).send(tokenObj)
}
