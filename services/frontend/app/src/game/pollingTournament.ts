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

		const tournamentData = result.data
		console.log('tournamentData', tournamentData)

		tournamentStore.status = tournamentData.tournament.status

		if (tournamentStore.status === 'ongoing') {
			// console.log('ON GOING : ', tournamentData)
			const p1 = tournamentStore.playersMap.get(
				tournamentData.tournament.matchs[0].player1Id
			)
			updateTournamentCellName('match1-p1', p1?.username || waitingPlayer)
			const p2 = tournamentStore.playersMap.get(
				tournamentData.tournament.matchs[0].player2Id
			)
			updateTournamentCellName('match1-p2', p2?.username || waitingPlayer)
			if (
				tournamentData.tournament.matchs[0].scorePlayer1 !== undefined &&
				tournamentData.tournament.matchs[0].scorePlayer2 !== undefined
			) {
				updateTournamentCellScore(
					'match1-p1',
					tournamentData.tournament.matchs[0].scorePlayer1,
					5
				)
				updateTournamentCellScore(
					'match1-p2',
					tournamentData.tournament.matchs[0].scorePlayer2,
					5
				)
			}

			const p3 = tournamentStore.playersMap.get(
				tournamentData.tournament.matchs[1].player1Id
			)
			updateTournamentCellName('match2-p1', p3?.username || waitingPlayer)
			const p4 = tournamentStore.playersMap.get(
				tournamentData.tournament.matchs[1].player2Id
			)
			updateTournamentCellName('match2-p2', p4?.username || waitingPlayer)
			if (
				tournamentData.tournament.matchs[1].scorePlayer1 !== undefined &&
				tournamentData.tournament.matchs[1].scorePlayer2 !== undefined
			) {
				updateTournamentCellScore(
					'match2-p1',
					tournamentData.tournament.matchs[1].scorePlayer1,
					5
				)
				updateTournamentCellScore(
					'match2-p2',
					tournamentData.tournament.matchs[1].scorePlayer2,
					5
				)
			}

			const final = tournamentData.tournament.matchs[2]
			if (final.player1Id) {
				const finalP1 = tournamentStore.playersMap.get(
					tournamentData.tournament.matchs[2].player1Id
				)
				updateTournamentCellName('final-p1', finalP1?.username || waitingPlayer)
			}
			if (final.player2Id) {
				const finalP2 = tournamentStore.playersMap.get(
					tournamentData.tournament.matchs[2].player2Id
				)
				updateTournamentCellName('final-p2', finalP2?.username || waitingPlayer)
			}
		}

		if (tournamentStore.status === 'completed') {
			const final = tournamentData.tournament.matchs[2]
			if (final.winnerId) {
				const winner = tournamentStore.playersMap.get(
					tournamentData.tournament.matchs[2].winnerId
				)
				updateTournamentCellName(
					'final-winner',
					winner?.username || waitingPlayer
				)
				if (
					tournamentData.tournament.matchs[2].scorePlayer1 !== undefined &&
					tournamentData.tournament.matchs[2].scorePlayer2 !== undefined
				) {
					updateTournamentCellScore(
						'final-p1',
						tournamentData.tournament.matchs[2].scorePlayer1,
						5
					)
					updateTournamentCellScore(
						'final-p2',
						tournamentData.tournament.matchs[2].scorePlayer2,
						5
					)
				}
			}
		}

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
