import { FastifyRequest, FastifyReply } from 'fastify'
import { createWsToken } from '@ft_transcendence/security'
import { addPlayerToGame } from '../game/gameManager/GM.js'
import createError from 'http-errors'
import { withGameError } from '../utils/errors/withGameError.js'

// TODO: error handling
// TODO: auto loose game if no conn the ws after token expire
export async function joinGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = request.user as { user_id: number; login: string }
	const param = request.params as { gameID: string }

	if (!user) throw createError(401, 'Unauthorized')

	withGameError(() => addPlayerToGame(param.gameID, user.user_id))

	reply.code(201). send(createWsToken(request.server, user))
}

