import { FastifyRequest, FastifyInstance } from 'fastify'
import WebSocket from 'ws'
import { initializeConnection } from '../usecases/websocketService.js'
import { IWsJwtTokenQuery } from '@ft_transcendence/common'
import { handleWsConnection } from '@ft_transcendence/security'

/**
 * Handles WebSocket connection for the social service.
 *
 * Process:
 * 1. Verifies JWT token from query parameters
 * 2. Initializes connection and registers user as online
 * 3. Sets up connection monitoring and presence tracking
 *
 * IMPORTANT: This service only sends notifications via WebSocket
 * (friend requests, status changes). It does not process incoming messages.
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
