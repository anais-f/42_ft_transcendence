import { FastifyRequest, FastifyReply } from 'fastify'
import { createWsToken } from '@ft_transcendence/security'
import createHttpError from 'http-errors'
import { joinGame } from '../../usecases/managers/gameManager/joinGame.js'
import { withGameError } from '../../usecases/managers/gameManager/errors/withGameError.js'
import { CodeParamSchema } from '@ft_transcendence/common'

export async function joinGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	console.log('salut')
	const user = request.user as { user_id: number; login: string }
	const param = CodeParamSchema.parse(request.params)
	console.log(param)

	// NOTE: idk if it's needed
	if (!user) throw createHttpError.BadRequest()

	withGameError(() => joinGame(param.code, user.user_id))
	const tokenObj = createWsToken(request.server, user)

	reply.code(201).send(tokenObj)
}
