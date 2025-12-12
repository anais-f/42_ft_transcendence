import WebSocket from 'ws'
import { games } from '../managers/gameData.js'
import { leaveGame } from '../managers/gameManager/leaveGame.js'
import { handleGamePacket } from './handleGamePacket.js'
import { handleJsonMessage } from './handleJsonMessage.js'
import { ConnectionContext } from './initConnection.js'

export function registerGameSocketEvents(
	socket: WebSocket,
	ctx: ConnectionContext
): void {
	socket.on('message', (data, isBinary) => {
		if (isBinary) {
			handleGamePacket(data as Buffer, ctx.gameCode, ctx.playerSlot)
		} else {
			try {
				const message = JSON.parse(data.toString())
				handleJsonMessage(message, ctx.user, ctx.gameCode, ctx.playerSlot)
			} catch (e) {
				console.error('Invalid JSON message:', e)
			}
		}
	})

	socket.on('close', (code) => {
		console.log(
			`[-] ${ctx.user.login}(${ctx.user.user_id}) disconnected from game: ${ctx.gameCode} (code: ${code})`
		)

		const currentGame = games.get(ctx.gameCode)
		const player = currentGame?.[ctx.playerSlot]
		if (player) {
			player.ws = null
		}

		try {
			leaveGame(ctx.gameCode)
		} catch (e) {
			console.error('Error on leaveGame:', e)
		}
	})
}
