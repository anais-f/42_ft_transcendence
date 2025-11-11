import type { FastifyReply, FastifyRequest } from 'fastify'
import { authenticator } from 'otplib'
import { verifyToken, signToken } from '../utils/jwt.js'
import { enableUser2FA, disableUser2FA, getUser2FASecret } from '../repositories/userRepository.js'
import { verify2FASchema } from '@ft_transcendence/common'

export async function enable2faController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const cookieToken = req.cookies?.auth_token as string | undefined
	const authHeader = req.headers.authorization
	let token: string | undefined = cookieToken
	if (!token && authHeader && authHeader.startsWith('Bearer ')) {
		token = authHeader.substring(7)
	}
	if (!token) {
		return reply.code(401).send({ error: 'Missing token' })
	}
	const payload = verifyToken(token)
	if (!payload || !payload.user_id) {
		return reply.code(401).send({ error: 'Invalid token' })
	}
	const secret = authenticator.generateSecret()
	if (!enableUser2FA(payload.user_id, secret)) {
		return reply.code(500).send({ error: 'Failed to enable 2FA' })
	}
	return reply.code(200).send({ secret: secret })
}

export async function verify2faController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const cookieToken = req.cookies?.twofa_token as string | undefined
	const authHeader = req.headers.authorization
	let token: string | undefined = cookieToken
	if (!token && authHeader && authHeader.startsWith('Bearer ')) {
		token = authHeader.substring(7)
	}
	if (!token) {
		return reply.code(401).send({ error: 'Missing token' })
	}
	const payload = verifyToken(token)
	if (!payload || !payload.user_id) {
		return reply.code(401).send({ error: 'Invalid token' })
	}
	const parsed = verify2FASchema.safeParse(req.body)
	if (!parsed.success) {
		return reply.code(400).send({ error: 'Invalid request body' })
	}
	const { twofa_code } = parsed.data
	if (!getUser2FASecret(payload.user_id))
	{
		return reply.code(500).send({ error: '2FA not enabled for user' })
	}
	const isValid = authenticator.check(twofa_code, getUser2FASecret(payload.user_id)!)
	if (!isValid) {
		return reply.code(401).send({ error: 'Invalid 2FA code' })
	}
	const newToken = signToken({ user_id: payload.user_id, login: payload.login, is_admin: payload.is_admin, type: 'auth' }, '1h')
	return reply.code(200).send({ token: newToken })
}

export async function disable2faController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const cookieToken = req.cookies?.auth_token as string | undefined
	const authHeader = req.headers.authorization
	let token: string | undefined = cookieToken
	if (!token && authHeader && authHeader.startsWith('Bearer ')) {
		token = authHeader.substring(7)
	}
	if (!token) {
		return reply.code(401).send({ error: 'Missing token' })
	}
	const payload = verifyToken(token)
	if (!payload || !payload.user_id) {
		return reply.code(401).send({ error: 'Invalid token' })
	}
	if (!disableUser2FA(payload.user_id)) {
		return reply.code(500).send({ error: 'Failed to disable 2FA' })
	}
	return reply.code(200).send({ success: true })
}
