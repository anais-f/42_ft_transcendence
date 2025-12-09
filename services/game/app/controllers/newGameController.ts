import { FastifyRequest, FastifyReply } from 'fastify'
import { ERROR_MESSAGES } from '@ft_transcendence/common'
import createHttpError from 'http-errors'

export async function createNewGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = request.user as { user_id: number; login: string }

	if (!user) {
		throw createHttpError.Unauthorized(ERROR_MESSAGES.UNAUTHORIZED)
	}

	/*
	const gameId = withGameError(() => {
		return requestGame({
			code: null,
			pID: user.user_id
		})
	})
	*/

	reply.code(201).send({ gameID: /*gameId*/ 0 }) // TODO
}
