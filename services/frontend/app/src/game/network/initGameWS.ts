import { createGameWebSocket } from '../../api/game/createGame.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { opponentJoinHandler } from '../../events/lobby/opponentJoinHandler.js'
import { ToastActionType } from '../../types/toast.js'
import { gameStore } from '../../usecases/gameStore.js'
import { dispatcher } from './dispatcher.js'

export function initGameWS(backTo: string) {
	gameStore.setOnOpponentJoin(opponentJoinHandler)
	gameStore.backTo = backTo
	const token = gameStore.sessionToken
	if (token) {
		createGameWebSocket(token)
			.then((ws: WebSocket) => {
				ws.binaryType = 'arraybuffer'
				gameStore.gameSocket = ws

				ws.onmessage = dispatcher

				ws.onerror = () => {}

				ws.onclose = () => {
					if (!gameStore.navigatingToGame) {
						window.navigate(gameStore.backTo)
					}
				}
			})
			.catch((error: any) => {
				gameStore.clear()
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
