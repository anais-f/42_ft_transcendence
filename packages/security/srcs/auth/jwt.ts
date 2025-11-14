import jwt from 'jsonwebtoken'

export interface IJWTPayload {
	user_id: number
	login: string
	is_admin?: boolean
	iat: number
	exp: number
}

/**
 * Check and decode a JWT token
 * @param token - The JWT token to verify
 * @returns The decoded payload if valid, otherwise null
 */
export function verifyToken(token: string): IJWTPayload | null {
	const secret = process.env.JWT_SECRET
	if (!secret) {
		throw new Error('JWT_SECRET environment variable is required to verify tokens')
	}

	try {
		const payload = jwt.verify(token, secret) as IJWTPayload
		return payload
	} catch (error) {
		return null
	}
}
