import jwt from 'jsonwebtoken'
import ms from 'ms'
import { env } from '../env/checkEnv.js'

export function signToken(
	payload: {
		user_id: number
		login: string
		is_admin: boolean
		type: string
	},
	expiresIn: ms.StringValue
): string {
	const secret = env.JWT_SECRET_AUTH
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
	const secret = env.JWT_SECRET_AUTH
	return jwt.verify(token, secret) as JwtPayload
}
