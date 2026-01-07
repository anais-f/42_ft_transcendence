import { FastifyInstance } from 'fastify'

export const WS_TOKEN_EXPIRES_SECONDS = Number(
	process.env.WS_TOKEN_EXPIRES_SECONDS
)

export interface WsTokenPayload {
	user_id: number
	login: string
}

export interface CreatedWsToken {
	wsToken: string
	expiresIn: number
}

export function createWsToken(
	fastify: FastifyInstance,
	user: WsTokenPayload
): CreatedWsToken {
	const payload = {
		user_id: user.user_id,
		login: user.login
	}

	const wsToken = (fastify as any).jwt.ws.sign(payload, {
		expiresIn: `${WS_TOKEN_EXPIRES_SECONDS}s`
	})

	return {
		wsToken,
		expiresIn: WS_TOKEN_EXPIRES_SECONDS
	}
}
