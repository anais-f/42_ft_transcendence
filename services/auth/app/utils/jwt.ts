import jwt from 'jsonwebtoken'

export function signToken(payload: { userId: number; login: string }) {
	return jwt.sign(payload, 'TO_CHANGE_WITH_SECRET', { expiresIn: '1h' })
}
