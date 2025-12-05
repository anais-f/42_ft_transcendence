import WebSocket from 'ws'
import { FastifyRequest, FastifyInstance } from 'fastify'
import { handleWsConnection } from '@ft_transcendence/security'

export async function handleGameWsConnection(
	socket: WebSocket,
	request: FastifyRequest<{ Querystring: { token: string } }>,
	fastify: FastifyInstance
): Promise<void> {
	// @ts-ignore
	let payload = await handleWsConnection(socket, request, fastify)
	if (!payload) {
		return
	}
}
