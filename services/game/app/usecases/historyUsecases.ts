import { getMatchHistoryByPlayerId } from '../repositories/matchsRepository.js'
import type { MatchHistoryResponseDTO } from '@ft_transcendence/common'

export function getUserMatchHistory(
	targetUserId: number
): MatchHistoryResponseDTO {
	const matches = getMatchHistoryByPlayerId(targetUserId)
	return {
		matches
	}
}
