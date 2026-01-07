import {
	activeGamesGauge,
	activeTournamentsGauge,
	playersInTournamentsGauge
} from '@ft_transcendence/monitoring'
import {
	games,
	tournaments,
	usersToTournament,
	GameStatus
} from './gameData.js'
import { TournamentStatus } from '@ft_transcendence/common'


export function updateGameMetrics(): void {
	const gamesByStatus: Record<GameStatus, number> = {
		waiting: 0,
		active: 0,
		ended: 0
	}

	for (const gameData of games.values()) {
		gamesByStatus[gameData.status]++
	}

	activeGamesGauge.set({ status: 'waiting' }, gamesByStatus.waiting)
	activeGamesGauge.set({ status: 'active' }, gamesByStatus.active)
	activeGamesGauge.set({ status: 'ended' }, gamesByStatus.ended)

	const tournamentsByStatus: Record<TournamentStatus, number> = {
		pending: 0,
		ongoing: 0,
		completed: 0
	}

	for (const tournament of tournaments.values()) {
		tournamentsByStatus[tournament.status]++
	}

	activeTournamentsGauge.set({ status: 'pending' }, tournamentsByStatus.pending)
	activeTournamentsGauge.set({ status: 'ongoing' }, tournamentsByStatus.ongoing)
	activeTournamentsGauge.set(
		{ status: 'completed' },
		tournamentsByStatus.completed
	)

	playersInTournamentsGauge.set(usersToTournament.size)
}
