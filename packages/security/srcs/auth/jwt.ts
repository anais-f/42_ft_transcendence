import jwt from 'jsonwebtoken'

/**
 * Payload JWT utilisé dans l'application
 */
export interface IJWTPayload {
	user_id: number
	login: string
	is_admin?: boolean
	iat: number
	exp: number
}

/**
 * Vérifie et décode un token JWT
 * @param token - Le token à vérifier
 * @returns Le payload décodé ou null si le token est invalide/expiré
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
