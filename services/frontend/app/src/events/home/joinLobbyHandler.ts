import { joinGameAPI } from '../../api/game/joinGame.js'
import { gameStore } from '../../usecases/gameStore.js'
import { sendGameError } from './errorMapUtils.js'
import { joinTournamentAPI } from '../../api/tournamentApi.js'
import { tournamentStore } from '../../usecases/tournamentStore.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { ToastActionType } from '../../types/toast.js'
import { showRejoinTournamentModal } from './rejoinTournamentModalHandler.js'

export async function handleJoinLobby(e: Event) {
	e.preventDefault()
	const input = document.getElementById('join_lobby') as HTMLInputElement
	const code = input?.value?.trim().toUpperCase()

	if (!code) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'Please enter a game or tournament code'
		})
		return
	}

	if (code.startsWith('T')) await handleJoinTournament(code)
	else if (code.startsWith('G')) await handleJoinGame(code)
	else sendGameError('', 400)
}

export async function handleJoinGame(code: string) {
	const { data, error, status } = await joinGameAPI(code)

	gameStore.gameCode = code
	if (error) {
		if (data?.tournamentCode) {
			showRejoinTournamentModal(data?.tournamentCode)
			gameStore.clear()
			return
		}
		sendGameError(error, status)
		gameStore.clear()
		return
	}

	gameStore.sessionToken = data.wsToken
	window.navigate(`/lobby/${code}`)
}

export async function handleJoinTournament(code: string) {
	const { data, error, status } = await joinTournamentAPI(code)

	if (error) {
		if (data?.tournamentCode) {
			showRejoinTournamentModal(data?.tournamentCode)
			return
		}
		sendGameError(error, status)
		tournamentStore.clear()
		return
	}

	tournamentStore.tournamentCode = code
	tournamentStore.status = data?.status || 'pending'
	window.navigate(`/tournament/${code}`)
}
