import { getMatchHistoryAPI } from '../../api/game/statsGameApi.js'
import { getStatsAPI } from '../../api/game/statsGameApi.js'
import { StatBox } from '../../components/game/StatBox.js'
import { GameHistoryRow } from '../../components/game/HistoryRow.js'
import { userByIdAPI } from '../../api/usersApi.js'

export async function fetchAndRenderStats(userId: number): Promise<void> {
	const statsContainer = document.getElementById('stats-boxes')
	if (!statsContainer) return

	const statsResponse = await getStatsAPI(userId)
	if (statsResponse.error || !statsResponse.data) {
		return
	}

	const stats = statsResponse.data

	statsContainer.innerHTML = `
		${StatBox({ label: 'Games Played', value: stats.totalGames, color: 'text-indigo-900' })}
		${StatBox({ label: 'Wins', value: stats.totalWins, color: 'text-emerald-900' })}
		${StatBox({ label: 'Losses', value: stats.totalLosses, color: 'text-rose-900' })}
		${StatBox({ label: 'Win Rate', value: stats.winRate?.toFixed(2) + '%', color: 'text-yellow-800' })}
	`
}

export async function fetchAndRenderMatchHistory(
	userId: number
): Promise<void> {
	const historyBody = document.getElementById('match-history')
	if (!historyBody) return

	const historyResponse = await getMatchHistoryAPI(userId)
	if (historyResponse.error || !historyResponse.data) {
		console.error('Failed to fetch match history:', historyResponse.error)
		return
	}

	const matches = historyResponse.data.matches

	const rows = []
	for (const match of matches) {
		const player1Response = await userByIdAPI(match.player1_id)
		const player1Name =
			player1Response.data?.username || `Player ${match.player1_id}`
		const player2Response = await userByIdAPI(match.player2_id)
		const player2Name =
			player2Response.data?.username || `Player ${match.player2_id}`

		rows.push(
			GameHistoryRow({
				date: new Date(match.played_at).toLocaleDateString('en-US', {
					timeZone: 'Europe/Paris'
				}),
				result: match.winner_id === userId ? 'Win' : 'Loss',
				player1: player1Name,
				player1Id: match.player1_id,
				score1: match.player1_score,
				score2: match.player2_score,
				player2: player2Name,
				player2Id: match.player2_id
			})
		)
	}

	historyBody.innerHTML = rows.join('')
}
