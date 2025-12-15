import jwt from 'jsonwebtoken'
import ms from 'ms'
import createHttpError from 'http-errors'
import { getEnv } from '../env/verifEnv.js'

function getJWTSecret(): string {
	return getEnv().JWT_SECRET
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

export function verifyToken(token: string): {
	user_id: number
	login: string
	is_admin?: boolean
	iat: number
	exp: number
} {
	const secret = getJWTSecret()
	return jwt.verify(token, secret) as any
}
