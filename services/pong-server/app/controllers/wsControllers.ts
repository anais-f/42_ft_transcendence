import WebSocket from 'ws'
import { FastifyRequest, FastifyInstance } from 'fastify'
import { handleWsConnection } from '@ft_transcendence/security'
import { IWsJwtTokenQuery } from '@ft_transcendence/common'

export async function handleGameWsConnection(
	socket: WebSocket,
	request: FastifyRequest<IWsJwtTokenQuery>,
	fastify: FastifyInstance
): Promise<void> {
	let payload = await handleWsConnection(socket, request, fastify)
	if (!payload) {
		return
	}
	console.log(payload)
}
