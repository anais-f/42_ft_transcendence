import { tournamentStore } from '../../usecases/tournamentStore.js'
import { updateAllPlayerCards } from '../../components/tournament/PlayerCard.js'
import { fetchTournament } from './tournamentSync.js'
import { updateBracket, updateOpponent } from './tournamentUI.js'
import { checkAndJoinUserMatches } from './tournamentMatchJoin.js'

type PollingState = 'idle' | 'running'

let state: PollingState = 'idle'
let pollingTimeoutId: ReturnType<typeof setTimeout> | null = null

const POLLING_INTERVAL_MS = 2000

export async function start(): Promise<void> {
	if (state === 'running') return

	stop()
	state = 'running'

	await poll()
	scheduleNext()
}

export function stop(): void {
	if (pollingTimeoutId) {
		clearTimeout(pollingTimeoutId)
		pollingTimeoutId = null
	}
	state = 'idle'
}

export function isRunning(): boolean {
	return state === 'running'
}

function scheduleNext(): void {
	if (state !== 'running') return

	pollingTimeoutId = setTimeout(async () => {
		if (state !== 'running') return

		await poll()
		scheduleNext()
	}, POLLING_INTERVAL_MS)
}

async function poll(): Promise<void> {
	if (state !== 'running') return

	try {
		const result = await fetchTournament(stop)
		if (!result.success) return

		const { data: tournamentData } = result

		await checkAndJoinUserMatches(tournamentData.tournament, stop)
		updateBracket('match', tournamentData)
		updateOpponent(tournamentData)
		updateAllPlayerCards('player_card_')

		if (tournamentStore.status === 'completed') {
			console.log('[TournamentPoller] Tournament completed, stopping')
			stop()
			window.navigate('/', { delay: 5000 })
		}
	} catch (error) {
		console.error('[TournamentPoller] Error:', error)
	}
}
