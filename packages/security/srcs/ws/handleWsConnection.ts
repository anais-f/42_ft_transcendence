import WebSocket from 'ws'
import { FastifyRequest, FastifyInstance } from 'fastify'
import {
	WSMessageType,
	WSCloseCodes,
	IJwtPayload,
	IWsJwtTokenQuery
} from '@ft_transcendence/common'

export async function handleWsConnection(
	socket: WebSocket,
	request: FastifyRequest<IWsJwtTokenQuery>,
	fastify: FastifyInstance
): Promise<IJwtPayload | null> {
	const token = request.query.token
	const jwtI = (fastify as any).jwt

	try {
		return jwtI.verify(token)
	} catch (err) {
		socket.send(
			JSON.stringify({
				type: WSMessageType.ERROR_OCCURRED,
				code: 'INVALID_TOKEN',
				message: 'Invalid or expired token'
			})
		)
		socket.close(
			1008,
			WSCloseCodes.POLICY_VIOLATION + ': Invalid or expired token'
		)
		return null
	}
}
