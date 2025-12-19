import {
	getMatchHistoryByPlayerId,
	getStatsByPlayerId
} from '../repositories/matchsRepository.js'
import type {
	MatchHistoryResponseDTO,
	PlayerStatsDTO
} from '@ft_transcendence/common'

export function getUserMatchHistory(
	targetUserId: number
): MatchHistoryResponseDTO {
	const matches = getMatchHistoryByPlayerId(targetUserId)
	return {
		matches
	}
}

export function getUserStats(targetUserId: number): PlayerStatsDTO {
	return getStatsByPlayerId(targetUserId)
}
