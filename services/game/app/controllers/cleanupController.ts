import { FastifyReply, FastifyRequest } from 'fastify'
import { cleanupUserGamesAndTournaments } from '../usecases/managers/cleanupUserGamesAndTournaments.js'
import createHttpError from 'http-errors'

export function cleanupUserController(
	request: FastifyRequest,
	reply: FastifyReply
): void {
	const { userId } = request.params as { userId: number }
	if (userId === undefined) {
		throw createHttpError.BadRequest('userId is required')
	}
	cleanupUserGamesAndTournaments(userId)

	reply.code(200).send()
}
