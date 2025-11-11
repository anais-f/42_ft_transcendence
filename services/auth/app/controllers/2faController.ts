import type { FastifyReply, FastifyRequest } from 'fastify'
import { authenticator } from 'otplib'
import { verifyToken, signToken } from '../utils/jwt.js'
import { setUser2FAEnabled } from '../repositories/userRepository.js'
import { verify2FASchema } from '@ft_transcendence/common'

const TWOFA_URL = process.env.TWOFA_SERVICE_URL
const TWOFA_SECRET = process.env.TWOFA_API_SECRET

async function call2fa(path: string, body: any) {
	if (!TWOFA_URL) throw new Error('TWOFA_SERVICE_URL not set')
	if (!TWOFA_SECRET) throw new Error('TWOFA_API_SECRET not set')
	const res = await fetch(`${TWOFA_URL}${path}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			authorization: TWOFA_SECRET
		},
		body: JSON.stringify(body)
	})
	const data = await res.json().catch(() => ({}))
	return { ok: res.ok, status: res.status, data }
}

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
		return reply.code(401).send({ error: 'Missing token 0' })
	}
	const payload = verifyToken(token)
	if (!payload || !payload.user_id) {
		return reply.code(401).send({ error: 'Invalid token' })
	}
	try {
		const issuer = process.env.TWOFA_ISSUER || 'FtTranscendence'
		const label = payload.login || String(payload.user_id)
		const { ok, status, data } = await call2fa('/api/2fa/setup', {
			user_id: payload.user_id,
			issuer,
			label
		})
		if (!ok) return reply.code(status).send(data)
		return reply.code(200).send({ otpauth_url: data.otpauth_url, qr_base64: data.qr_base64, expires_at: data.expires_at })
	} catch (e: any) {
		return reply.code(500).send({ error: '2FA service error' })
	}
}

export async function verify2faController(
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
		return reply.code(401).send({ error: 'Missing token 1' })
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
	try {
		const { ok, status, data } = await call2fa('/api/2fa/verify', {
			user_id: payload.user_id,
			code: twofa_code
		})
		if (!ok) return reply.code(status).send(data)
		// Mark enabled and issue final auth token
		setUser2FAEnabled(payload.user_id, true)
		const newToken = signToken(
			{ user_id: payload.user_id, login: payload.login, is_admin: payload.is_admin, type: 'auth' },
			'1h'
		)
		return reply.code(200).send({ token: newToken })
	} catch (e: any) {
		return reply.code(500).send({ error: '2FA service error' })
	}
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
		return reply.code(401).send({ error: 'Missing token 2' })
	}
	const payload = verifyToken(token)
	if (!payload || !payload.user_id) {
		return reply.code(401).send({ error: 'Invalid token' })
	}
	try {
		const { ok, status, data } = await call2fa('/api/2fa/disable', {
			user_id: payload.user_id
		})
		if (!ok) return reply.code(status).send(data)
		setUser2FAEnabled(payload.user_id, false)
		return reply.code(200).send({ success: true })
	} catch (e: any) {
		return reply.code(500).send({ error: '2FA service error' })
	}
}
