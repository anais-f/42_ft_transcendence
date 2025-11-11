import jwt from 'jsonwebtoken'
import ms from 'ms'

export function signToken(
	payload: {
		user_id: number
		login?: string
		is_admin?: boolean
		type: string
	},
	expiresIn: ms.StringValue
): string {
	const secret = process.env.JWT_SECRET
	if (!secret) {
		throw new Error(
			'JWT_SECRET environment variable is required to sign tokens'
		)
	}
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
		throw new Error(
			'JWT_SECRET environment variable is required to verify tokens'
		)
	return jwt.verify(token, secret) as any
}
