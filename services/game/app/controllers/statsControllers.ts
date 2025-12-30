import { FastifyReply, FastifyRequest } from 'fastify'
import {
	IdParamSchema,
	PlayerStatsDTO,
	type MatchHistoryResponseDTO
} from '@ft_transcendence/common'
import { getUserMatchHistory, getUserStats } from '../usecases/statsUsecases.js'
import createHttpError from 'http-errors'

export function getUserMatchHistoryController(
	request: FastifyRequest,
	reply: FastifyReply
): MatchHistoryResponseDTO {
	const userId = request.user.user_id
	if (userId === undefined) {
		throw createHttpError.Unauthorized()
	}
	const targetUserId = IdParamSchema.parse(request.params).id
	return getUserMatchHistory(Number(targetUserId))
}

export function getUserStatsController(
	request: FastifyRequest,
	reply: FastifyReply
): PlayerStatsDTO {
	const userId = request.user.user_id
	if (userId === undefined) {
		throw createHttpError.Unauthorized()
	}
	const targetUserId = IdParamSchema.parse(request.params).id

	return getUserStats(Number(targetUserId))
}
