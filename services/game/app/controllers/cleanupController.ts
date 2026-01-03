import { FastifyReply, FastifyRequest } from 'fastify'
import { cleanupUserGamesAndTournaments } from '../usecases/managers/cleanupUserGamesAndTournaments.js'
import createHttpError from 'http-errors'

export function cleanupUserController(
	request: FastifyRequest,
	reply: FastifyReply
): void {
	const { user_id } = request.params as { user_id: number }
	if (user_id === undefined) {
		throw createHttpError.BadRequest('user_id is required')
	}
	cleanupUserGamesAndTournaments(user_id)

	reply.code(200).send()
}
