import { FastifyReply, FastifyRequest } from 'fastify'
import { IdParamSchema, type MatchHistoryResponseDTO } from '@ft_transcendence/common'
import { getUserMatchHistory } from '../usecases/historyUsecases.js'
import createHttpError from 'http-errors'

export function getUserMatchHistoryController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const userId = request.user.user_id
	if (userId === undefined) {
		throw createHttpError.Unauthorized()
	}
	const targetUserId = IdParamSchema.parse(request.params).id
	const result: MatchHistoryResponseDTO = getUserMatchHistory(Number(targetUserId))
	return reply.send(result)
}
