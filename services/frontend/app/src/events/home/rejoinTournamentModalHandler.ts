import { quitTournamentAPI } from '../../api/tournamentApi.js'
import { hideModal, showModal } from '../../components/modals/Modal.js'
import {
	REJOIN_TOURNAMENT_MODAL,
	updateModalTournamentCode
} from '../../components/modals/rejoinTournament.js'
import { handleJoinTournament } from './joinLobbyHandler.js'

let currentTournamentCode: string | null = null

export function showRejoinTournamentModal(tournamentCode: string) {
	currentTournamentCode = tournamentCode
	showModal(REJOIN_TOURNAMENT_MODAL)
	updateModalTournamentCode(tournamentCode)
}

export async function handleRejoinTournament() {
	hideModal(REJOIN_TOURNAMENT_MODAL)
	if (currentTournamentCode) {
		handleJoinTournament(currentTournamentCode)
		currentTournamentCode = null
	}
}

export async function handleQuiTournament() {
	hideModal(REJOIN_TOURNAMENT_MODAL)
	currentTournamentCode = null
	await quitTournamentAPI()
}
