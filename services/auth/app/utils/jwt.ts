import jwt from 'jsonwebtoken'
import ms from 'ms'
import createHttpError from 'http-errors'

export function signToken(
	payload: {
		user_id: number
		login?: string
		session_id?: number
		is_admin?: boolean
		type: string
	},
	expiresIn: ms.StringValue
): string {
	const secret = process.env.JWT_SECRET
	if (!secret)
		throw createHttpError.InternalServerError(
			'JWT_SECRET environment variable is required to sign tokens'
		)

	return jwt.sign(payload, secret, { expiresIn: expiresIn })
}

export function verifyToken(token: string): {
	user_id: number
	login: string
	is_admin?: boolean
	iat: number
	exp: number
} {
	const secret = process.env.JWT_SECRET
	if (!secret)
		throw createHttpError.InternalServerError(
			'JWT_SECRET environment variable is required to verify tokens'
		)

	return jwt.verify(token, secret) as any
}
