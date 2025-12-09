import { FastifyReply, FastifyRequest } from 'fastify'
import { IdParamSchema } from '@ft_transcendence/common'
import { getMatchHistoryByPlayerId } from '../repositories/matchsRepository.js'

export function getUserMatchHistoryController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const userId = request.user.user_id
	if (userId === undefined) {
		return reply.status(401).send({ error: 'Unauthorized' })
	}
	const targetUserId = IdParamSchema.parse(request.params).id
	const matches = getMatchHistoryByPlayerId(Number(targetUserId))
	return reply.send({ success: true, matches })
}
