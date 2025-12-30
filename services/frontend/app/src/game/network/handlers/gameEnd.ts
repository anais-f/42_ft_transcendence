import { GameWSCloseCodes } from '@ft_transcendence/pong-shared'
import { gameStore } from '../../../usecases/gameStore.js'
import { currentUser } from '../../../usecases/userStore.js'
import { renderer } from '../../core/Renderer.js'
import { notyfGlobal as notfy } from '../../../utils/notyf.js'

interface EogData {
	winnerId: number
	loserId: number
	p1Score: number
	p2Score: number
	reason: 'score' | 'forfeit'
}

export function eogHandler(data: unknown) {
	const eogData = data as EogData
	console.log('Game ended:', eogData)

	const myId = currentUser?.user_id
	const didWin = myId === eogData.winnerId

	let message = buildNotification(didWin, eogData)

	console.log(message)
	notfy.open({ type: didWin ? 'success' : 'error', message })
	renderer.setGameResult(didWin ? 'win' : 'lose')

	const ws = gameStore.gameSocket
	if (ws) {
		ws.close(GameWSCloseCodes.NORMAL)
		gameStore.gameSocket = null
	}
}

function buildNotification(didWin: boolean, eogData: EogData): string {
	let message: string

	const winnerIsP1 = gameStore.playerSlot === 'p1' ? didWin : !didWin
	const winnerName = winnerIsP1
		? gameStore.p1?.username
		: gameStore.p2?.username

	if (eogData.reason === 'forfeit') {
		message = 'Victory! Your opponent left the game'
	} else {
		const scoreText = `${eogData.p1Score} - ${eogData.p2Score}`
		message = didWin
			? `Victory! You won ${scoreText}`
			: `${winnerName ?? 'Opponent'} wins ${scoreText}`
	}

	return message
}
