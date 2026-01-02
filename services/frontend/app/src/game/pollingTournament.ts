import { getTournamentAPI } from '../api/tournamentApi.js'
import { updateAllPlayerCards } from '../components/tournament/PlayerCard.js'
import { tournamentStore } from '../usecases/tournamentStore.js'
import { currentUser } from '../usecases/userStore.js'
import { notyfGlobal as notyf } from '../utils/notyf.js'
import { ToastActionType } from '../types/toast.js'
import { IApiResponse } from '../types/api.js'
import {
	updateTournamentCellName,
	updateTournamentCellScore
} from '../components/game/TournamentCell.js'
import { waitingPlayer } from '../pages/TournamentPage.js'
import { GetTournamentResponseDTO } from '@ft_transcendence/common'
import { handleJoinGameTournament } from '../events/tournament/gameTournament.js'
import {initGameWS} from "./network/initGameWS.js";

export let pollingInterval: ReturnType<typeof setTimeout> | null

export function setPollingInterval(
	value: ReturnType<typeof setTimeout> | null
): void {
	pollingInterval = value
}

export async function pollingTournament() {
	try {
		if (!tournamentStore.tournamentCode) return
		const result = await getTournamentAPI(tournamentStore.tournamentCode)
		// console.log(result)
		if (errorGetTournament(result)) return

		const tournamentData: GetTournamentResponseDTO = result.data
		console.log('tournamentData', tournamentData)

		tournamentStore.status = tournamentData.tournament.status

		await updateMatches('match', tournamentData)

		await tournamentStore.syncPlayers(tournamentData.tournament.participants)

		updateAllPlayerCards('player_card_')

		if (tournamentStore.status === 'completed') {
			console.log('Tournament completed, stopping polling.')
			return
		}

		pollingInterval = setTimeout(pollingTournament, 2000)
	} catch (error) {
		console.error('Error fetching tournament data:', error)
		pollingInterval = setTimeout(pollingTournament, 5000)
	}
}

function errorGetTournament(result: IApiResponse): boolean {
	if ([403, 401, 409, 404].includes(result.status)) {
		console.log('Not a participant, redirecting...')
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: result.error || "You're not a participant of this tournament"
		})
		window.navigate('/')
		return true
	}
	if (result.error) {
		console.error('Error fetching tournament data:', result.error)
		return true
	}
	return false
}

/**
 * Check if the current user needs to join any of their matches
 * and automatically join them if they haven't already
 */
async function checkAndJoinUserMatches(
	tournament: GetTournamentResponseDTO['tournament']
): Promise<void> {
	if (!['completed', 'ongoing'].includes(tournament.status)) {
		return
	}

	if (!currentUser?.user_id) {
		return
	}

	// Check first 2 matches (semi-finals) to see if user needs to join
	for (let matchIndex = 0; matchIndex < 2; matchIndex++) {
		const match = tournament.matchs[matchIndex]

		// Skip if match has no game code
		if (!match.gameCode) continue

		// Check if current user is a participant in this match
		const isUserInMatch =
			match.player1Id === currentUser.user_id ||
			match.player2Id === currentUser.user_id

		if (!isUserInMatch) continue

		// Check if user has already joined this match
		const gameCodeKey = `gameCode${matchIndex + 1}` as
			| 'gameCode1'
			| 'gameCode2'
		const alreadyJoined = tournamentStore[gameCodeKey]

		// Join match if not already joined and match is still ongoing
		if (!alreadyJoined && match.winnerId === undefined) {
			tournamentStore[gameCodeKey] = match.gameCode
			console.log(`Joining match ${matchIndex}:`, match.gameCode)

			await handleJoinGameTournament(match.gameCode)
			initGameWS(`/tournament/${tournamentStore.tournamentCode}`)
		}
	}
}

async function updateMatches(id: string, tournamentData: GetTournamentResponseDTO) {
	const tournament = tournamentData.tournament
	if (!tournament || !['completed', 'ongoing'].includes(tournament.status)) {
		return
	}

	// Check and join user matches
	await checkAndJoinUserMatches(tournament)

	for (let matchIndex = 0; matchIndex < 3; ++matchIndex) {
		for (let playerIndex = 0; playerIndex < 2; ++playerIndex) {
			// update Name
			const p = tournamentStore.playersMap.get(
				tournament.matchs[matchIndex][`player${playerIndex + 1}Id`]
			)
			updateTournamentCellName(
				`${id}${matchIndex}-p${playerIndex + 1}`,
				p?.username || waitingPlayer
			)

			// update Score
			const score =
				tournament.matchs[matchIndex][`scorePlayer${playerIndex + 1}`]
			if (score !== undefined) {
				const scoreId = `${id}${matchIndex}-p${playerIndex + 1}`
				updateTournamentCellScore(scoreId, score, 5)
			}
		}
	}

	const winnerId = tournament.matchs[2]?.winnerId
	if (!winnerId) {
		return
	}

	const winner = tournamentStore.playersMap.get(winnerId)
	updateTournamentCellName('final-winner', winner?.username || waitingPlayer)
}
