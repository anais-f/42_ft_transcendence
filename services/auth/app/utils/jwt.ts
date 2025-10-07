import jwt from 'jsonwebtoken'
import { ENV } from '../config/env.js'

export function signToken(payload: { userId: number; username: string }) {
	return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '1h' })
}
