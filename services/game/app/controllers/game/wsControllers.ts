import WebSocket from 'ws'
import { FastifyRequest, FastifyInstance } from 'fastify'
import { IWsJwtTokenQuery } from '@ft_transcendence/common'
import { handleWsConnection, WsTokenPayload } from '@ft_transcendence/security'
import { initGameWsConnection } from '../../usecases/wsHandlers/initConnection.js'
import { registerGameSocketEvents } from '../../usecases/wsHandlers/registerSocketEvents.js'

export async function handleGameWsConnection(
	socket: WebSocket,
	request: FastifyRequest<IWsJwtTokenQuery>,
	fastify: FastifyInstance
): Promise<void> {
	const payload = await handleWsConnection(socket, request, fastify)
	if (!payload) {
		return
	}

	try {
		const context = initGameWsConnection(socket, payload as WsTokenPayload)
		registerGameSocketEvents(socket, context)
	} catch (e) {
		console.error('Connection error:', e)
	}
}
