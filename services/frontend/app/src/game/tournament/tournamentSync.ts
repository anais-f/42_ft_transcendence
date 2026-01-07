import { GetTournamentResponseDTO } from '@ft_transcendence/common'
import { getTournamentAPI } from '../../api/tournamentApi.js'
import { tournamentStore } from '../../usecases/tournamentStore.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { ToastActionType } from '../../types/toast.js'
import { IApiResponse } from '../../types/api.js'

export type SyncResult =
	| { success: true; data: GetTournamentResponseDTO }
	| { success: false }

export async function fetchTournament(
	onStopPolling: () => void
): Promise<SyncResult> {
	if (!tournamentStore.tournamentCode) {
		return { success: false }
	}

	const result = await getTournamentAPI(tournamentStore.tournamentCode)

	if (isErrorResponse(result, onStopPolling)) {
		return { success: false }
	}

	const tournamentData: GetTournamentResponseDTO = result.data

	tournamentStore.status = tournamentData.tournament.status
	await tournamentStore.syncPlayers(tournamentData.tournament.participants)

	return { success: true, data: tournamentData }
}

function isErrorResponse(
	result: IApiResponse,
	onStopPolling: () => void
): boolean {
	if ([400, 401, 403, 404, 409].includes(result.status)) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message:
				result.error || "Invalid tournament code or you're not a participant"
		})
		onStopPolling()
		window.navigate('/')
		return true
	}
	if (result.error) {
		return true
	}
	return false
}
