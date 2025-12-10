import WebSocket from 'ws'
import { FastifyRequest, FastifyInstance } from 'fastify'
import { createWsError, IWsJwtTokenQuery } from '@ft_transcendence/common'
import { games, playerToGame, TPlayerSlot } from '../game/gameManager/gamesData'
import { handleWsConnection } from '@ft_transcendence/security'

export async function handleGameWsConnection(
	socket: WebSocket,
	request: FastifyRequest<IWsJwtTokenQuery>,
	fastify: FastifyInstance
): Promise<void> {
	let payload = await handleWsConnection(socket, request, fastify)
	if (!payload) { return }

	try {
		await initializeConnection(socket, payload)
	} catch (e) {
		console.log(e)
	}
}

//TODO: error management
//TODO: use a define map for custom ws errors
async function initializeConnection(socket: WebSocket, payload: any) {
	const user = payload as { user_id: number; login: string }

	const gameCode = playerToGame.get(user.user_id)
	if (!gameCode) throw createWsError(socket, 4000, 'player have no active game') 

	const gameData = games.get(gameCode)
	if (!gameData) throw createWsError(socket, 4001, 'game not found') 
	
	const playerSlot: TPlayerSlot = gameData.p1.id === user.user_id ? 'p1' : 'p2'
	
	// @ts-ignore - gameData.p2 can't be null (if playerSlot == p2)
	gameData[playerSlot].connState = true
	console.log(`[+] ${user.login} join game: ${playerToGame.get(user.user_id)} as ${playerSlot}`)
}
