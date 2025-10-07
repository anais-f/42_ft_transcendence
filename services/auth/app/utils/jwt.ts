import jwt from 'jsonwebtoken'

export function signToken(payload: { userId: number; username: string }) {
	return jwt.sign(payload, 'coucou', { expiresIn: '1h' })
}
