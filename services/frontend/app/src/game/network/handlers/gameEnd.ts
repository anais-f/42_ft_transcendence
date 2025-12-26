import { Vector2 } from '@ft_transcendence/pong-shared/index.js'
import { gameStore } from '../../../usecases/gameStore.js'
import { renderer } from '../../core/Renderer.js'
import { notyfGlobal as notfy } from '../../../utils/notyf.js'

export function eogHandler(data: unknown) {
	const { reason } = data as { reason: string }
	console.log('Game ended:', reason)
	notfy.open({ type: 'info', message: reason })

	const playerSlot = gameStore.playerSlot
	const didWin =
		(reason === 'p1 won' && playerSlot === 'p1') ||
		(reason === 'p2 won' && playerSlot === 'p2')

	renderer.setGameResult(didWin ? 'win' : 'lose')

	const ws = gameStore.gameSocket
	if (ws) {
		ws.close()
		gameStore.gameSocket = null
	}
}
