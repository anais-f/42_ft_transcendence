import { FastifyRequest, FastifyInstance } from 'fastify'
import WebSocket from 'ws'
import { initializeConnection } from '../usecases/websocketService.js'
import { IWsJwtTokenQuery } from '@ft_transcendence/common'
import { handleWsConnection } from '@ft_transcendence/security'

/**
 * Handle WebSocket connection: verify token and setup connection.
 * This is the ONLY place where WS logic lives - everything else is in services.
 */
export async function handleSocialWSConnection(
	socket: WebSocket,
	request: FastifyRequest<IWsJwtTokenQuery>,
	fastify: FastifyInstance
): Promise<void> {
	let payload = await handleWsConnection(socket, request, fastify)
	if (!payload) return

	const userId = payload.user_id
	const userLogin = payload.login

	try {
		await initializeConnection(socket, userId, userLogin)
	} catch (error) {
		return
	}
}
