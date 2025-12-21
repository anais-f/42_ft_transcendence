import { fetchMatchHistory } from '../../api/game/statsGameApi.js'
import { fetchStats } from '../../api/game/statsGameApi.js'
import { StatBox } from '../../components/game/StatBox.js'
import { GameHistoryRow } from '../../components/game/HistoryRow.js'
import { fetchUserById } from '../../api/usersApi.js'

/**
 * Fetch user stats and render them into the stats container
 * @param userId
 */
export async function fetchAndRenderStats(userId: number): Promise<void> {
	const statsContainer = document.getElementById('stats-boxes')
	if (!statsContainer) return

	const statsResponse = await fetchStats(userId)
	if (statsResponse.error || !statsResponse.data) {
		console.error('Failed to fetch user stats:', statsResponse.error)
		return
	}

	const stats = statsResponse.data

	statsContainer.innerHTML = `
		${StatBox({ label: 'Games Played', value: stats.totalGames, color: 'text-indigo-900' })}
		${StatBox({ label: 'Wins', value: stats.totalWins, color: 'text-emerald-900' })}
		${StatBox({ label: 'Losses', value: stats.totalLosses, color: 'text-rose-900' })}
		${StatBox({ label: 'Win Rate', value: stats.winRate + '%', color: 'text-yellow-800' })}
	`
}

/**
 * Fetch user match history and render it into the history container
 * @param userId
 */
export async function fetchAndRenderMatchHistory(
	userId: number
): Promise<void> {
	const historyBody = document.getElementById('match-history')
	if (!historyBody) return

	const historyResponse = await fetchMatchHistory(userId)
	if (historyResponse.error || !historyResponse.data) {
		console.error('Failed to fetch match history:', historyResponse.error)
		return
	}

	const matches = historyResponse.data.matches

	const rows = []
	for (const match of matches) {
		const player1Response = await fetchUserById(match.player1_id)
		const player1Name =
			player1Response.data?.username || `Player ${match.player1_id}`
		const player2Response = await fetchUserById(match.player2_id)
		const player2Name =
			player2Response.data?.username || `Player ${match.player2_id}`

		rows.push(
			GameHistoryRow({
				date: new Date(match.played_at).toLocaleDateString(),
				result: match.winner_id === userId ? 'Win' : 'Loss',
				player1: player1Name,
				score1: match.player1_score,
				score2: match.player2_score,
				player2: player2Name
			})
		)
	}

	historyBody.innerHTML = rows.join('')
}
