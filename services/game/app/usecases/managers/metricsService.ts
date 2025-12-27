import {
	activeGamesGauge,
	activeTournamentsGauge,
	playersInTournamentsGauge
} from '@ft_transcendence/monitoring'
import {
	games,
	tournaments,
	usersInTournaments,
	GameStatus
} from './gameData.js'
import { TournamentStatus } from '@ft_transcendence/common'

/**
 * Update all game-related Prometheus metrics
 */
export function updateGameMetrics(): void {
	// Count games by status
	const gamesByStatus: Record<GameStatus, number> = {
		waiting: 0,
		active: 0,
		ended: 0
	}

	for (const gameData of games.values()) {
		gamesByStatus[gameData.status]++
	}

	// Update game metrics
	activeGamesGauge.set({ status: 'waiting' }, gamesByStatus.waiting)
	activeGamesGauge.set({ status: 'active' }, gamesByStatus.active)
	activeGamesGauge.set({ status: 'ended' }, gamesByStatus.ended)

	// Count tournaments by status
	const tournamentsByStatus: Record<TournamentStatus, number> = {
		pending: 0,
		ongoing: 0,
		completed: 0
	}

	for (const tournament of tournaments.values()) {
		tournamentsByStatus[tournament.status]++
	}

	// Update tournament metrics
	activeTournamentsGauge.set({ status: 'pending' }, tournamentsByStatus.pending)
	activeTournamentsGauge.set({ status: 'ongoing' }, tournamentsByStatus.ongoing)
	activeTournamentsGauge.set(
		{ status: 'completed' },
		tournamentsByStatus.completed
	)

	// Update players in tournaments
	playersInTournamentsGauge.set(usersInTournaments.size)

	console.log(
		`[Metrics] Games: waiting=${gamesByStatus.waiting} active=${gamesByStatus.active} ended=${gamesByStatus.ended}`
	)
	console.log(
		`[Metrics] Tournaments: pending=${tournamentsByStatus.pending} ongoing=${tournamentsByStatus.ongoing} completed=${tournamentsByStatus.completed}`
	)
	console.log(`[Metrics] Players in tournaments:  ${usersInTournaments.size}`)
}
