import { createGameWebSocket } from '../../api/game/createGame.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { oppenentJoinHandler } from '../../events/lobby/opponentJoinHandler.js'
import { ToastActionType } from '../../types/toast.js'
import { gameStore } from '../../usecases/gameStore.js'
import { dispatcher } from './dispatcher.js'

export function initGameWS(backTo: string) {
	gameStore.setOnOpponentJoin(oppenentJoinHandler)
	gameStore.backTo = backTo
	const token = gameStore.sessionToken
	if (token) {
		createGameWebSocket(token)
			.then((ws: WebSocket) => {
				console.log('WS connected')
				ws.binaryType = 'arraybuffer'
				gameStore.gameSocket = ws

				ws.onmessage = dispatcher

				ws.onerror = (error) => {
					console.error('WS error:', error)
				}

				ws.onclose = () => {
					if (!gameStore.navigatingToGame) {
						window.navigate(gameStore.backTo)
					}
					console.log('WS closed')
				}
			})
			.catch((error: any) => {
				console.error('WS connection failed:', error)
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: 'Connection to game server failed'
				})
				window.navigate(gameStore.backTo)
			})
	} else {
		window.navigate(gameStore.backTo)
	}
}
