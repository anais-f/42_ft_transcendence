import jwt from 'jsonwebtoken'
import ms from 'ms'
import { env } from '../env/checkEnv.js'

function getJWTSecret(): string {
	return env.JWT_SECRET
}

export function signToken(
	payload: {
		user_id: number
		login?: string
		is_admin?: boolean
		type: string
	},
	expiresIn: ms.StringValue
): string {
	const secret = getJWTSecret()
	return jwt.sign(payload, secret, { expiresIn: expiresIn })
}

export interface JwtPayload {
	user_id: number
	login: string
	is_admin?: boolean
	iat: number
	exp: number
}

export function verifyToken(token: string): JwtPayload {
	const secret = getJWTSecret()
	return jwt.verify(token, secret) as JwtPayload
}
