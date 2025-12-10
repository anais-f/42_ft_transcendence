import { FastifyRequest, FastifyReply } from 'fastify'
import { joinGame } from '../game/gameManager/joinGame.js'
import { withGameError } from '../utils/errors/withGameError.js'
import { createWsToken } from '@ft_transcendence/security'
import createHttpError from 'http-errors'

export async function joinGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = request.user as { user_id: number; login: string }
	const param = request.params as { gameCode: string }

	// NOTE: idk if it's needed
	if (!user) throw createHttpError.BadRequest()

	withGameError(() => joinGame(param.gameCode, user.user_id))
	const tokenObj = createWsToken(request.server, user)

	reply.code(201).send(tokenObj)
}
