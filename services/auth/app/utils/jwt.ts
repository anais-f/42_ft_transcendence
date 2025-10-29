import jwt from 'jsonwebtoken'

export function signToken(payload: { user_id: number; login: string }) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required to sign tokens')
  }
  return jwt.sign(payload, secret, { expiresIn: '1h' })
}
