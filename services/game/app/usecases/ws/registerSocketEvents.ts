import WebSocket from 'ws'
import { games } from '../managers/gameData.js'
import * as GameManager from '../managers/gameManager/index.js'
import * as wsHandler from './handler/index.js'
import { ConnectionContext } from './initConnection.js'

export function registerGameSocketEvents(
	socket: WebSocket,
	ctx: ConnectionContext
): void {
	socket.on('message', (data, isBinary) => {
		if (isBinary) {
			wsHandler.handleGamePacket(data as Buffer, ctx.gameCode, ctx.playerSlot)
		} else {
			try {
				const message = JSON.parse(data.toString())
				wsHandler.handleJsonMessage(
					message,
					ctx.user,
					ctx.gameCode,
					ctx.playerSlot
				)
			} catch (e) {}
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
			GameManager.leaveGame(ctx.gameCode)
		} catch (e) {}
	})
}
