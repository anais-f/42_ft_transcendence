import type { FastifyReply, FastifyRequest } from 'fastify'
import createHttpError from 'http-errors'
import { authenticator } from 'otplib'
import { verifyToken, signToken } from '../utils/jwt.js'
import {
	setUser2FAEnabled,
	isUser2FAEnabled
} from '../repositories/userRepository.js'
import { twofaCodeSchema } from '@ft_transcendence/common'

const TWOFA_URL = process.env.TWOFA_SERVICE_URL
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET

async function call2fa(path: string, body: any) {
	if (!TWOFA_URL)
		throw createHttpError.InternalServerError('TWOFA_SERVICE_URL not set')
	if (!INTERNAL_API_SECRET)
		throw createHttpError.InternalServerError('INTERNAL_API_SECRET not set')

	try {
		const res = await fetch(`${TWOFA_URL}${path}`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: INTERNAL_API_SECRET
			},
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(5000)
		})
		const data = await res.json().catch(() => ({}))
		return { ok: res.ok, status: res.status, data }
	} catch (e: any) {
		if (e.name === 'TimeoutError' || e.name === 'AbortError') {
			throw createHttpError.GatewayTimeout('2FA service timeout')
		}
		throw createHttpError.ServiceUnavailable('2FA service unavailable')
	}
}

export async function enable2faController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const cookieToken = req.cookies.auth_token
	if (!cookieToken) throw createHttpError.Unauthorized('Missing cookieToken')

	const payload = verifyToken(cookieToken)
	if (!payload || !payload.user_id)
		throw createHttpError.Unauthorized('Invalid cookieToken')

	const issuer = process.env.TWOFA_ISSUER || 'FtTranscendence'
	const label = payload.login || String(payload.user_id)
	const { ok, status, data } = await call2fa('/api/2fa/setup', {
		user_id: payload.user_id,
		issuer,
		label
	})
	if (!ok) throw createHttpError(status, data.error || '2FA service error')

	return reply.code(200).send({
		otpauth_url: data.otpauth_url,
		qr_base64: data.qr_base64,
		expires_at: data.expires_at
	})
}

export async function verify2faSetupController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const cookieToken = req.cookies.auth_token
	if (!cookieToken)
		throw createHttpError.Unauthorized('Missing cookieToken (setup)')

	const payload = verifyToken(cookieToken)
	if (!payload || !payload.user_id)
		throw createHttpError.Unauthorized('Invalid cookieToken')

	const parsed = twofaCodeSchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid request body')

	const { twofa_code } = parsed.data
	const { ok, status, data } = await call2fa('/api/2fa/verify', {
		user_id: payload.user_id,
		twofa_code
	})
	if (!ok) throw createHttpError(status, data.error || '2FA service error')

	setUser2FAEnabled(payload.user_id, true)
	return reply.code(200).send({ success: true })
}

export async function verify2faLoginController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const cookieToken = req.cookies.twofa_token
	if (!cookieToken) throw createHttpError.Unauthorized('Missing cookieToken')

	const payload = verifyToken(cookieToken)
	if (!payload || !payload.user_id)
		throw createHttpError.Unauthorized('Invalid cookieToken')

	const parsed = twofaCodeSchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid request body')

	const { twofa_code } = parsed.data
	const { ok, status, data } = await call2fa('/api/2fa/verify', {
		user_id: payload.user_id,
		twofa_code
	})
	if (!ok) throw createHttpError(status, data.error || '2FA service error')

	setUser2FAEnabled(payload.user_id, true)
	const newToken = signToken(
		{
			user_id: payload.user_id,
			login: payload.login,
			is_admin: payload.is_admin,
			type: 'auth'
		},
		'1h'
	)
	reply.setCookie('auth_token', newToken, {
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: 60 * 15
	})
	reply.clearCookie('twofa_token', { path: '/' })
	return reply.code(200).send({ cookieToken: newToken })
}

export async function disable2faController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const cookieToken = req.cookies.auth_token
	if (!cookieToken) throw createHttpError.Unauthorized('Missing cookieToken')

	const payload = verifyToken(cookieToken)
	if (!payload || !payload.user_id)
		throw createHttpError.Unauthorized('Invalid cookieToken')

	const parsed = twofaCodeSchema.safeParse(req.body)
	if (!parsed.success)
		throw createHttpError.BadRequest(
			'Invalid request body - twofa_code required'
		)

	const { twofa_code } = parsed.data
	const verify = await call2fa('/api/2fa/verify', {
		user_id: payload.user_id,
		twofa_code
	})
	if (!verify.ok)
		throw createHttpError(
			verify.status,
			verify.data.error || '2FA service error'
		)

	const { ok, status, data } = await call2fa('/api/2fa/disable', {
		user_id: payload.user_id
	})
	if (!ok) throw createHttpError(status, data.error || '2FA service error')

	setUser2FAEnabled(payload.user_id, false)
	return reply.code(200).send({ success: true })
}

export async function status2faController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const cookieToken = req.cookies.auth_token
	if (!cookieToken) throw createHttpError.Unauthorized('Missing cookieToken')

	const payload = verifyToken(cookieToken)
	if (!payload || !payload.user_id)
		throw createHttpError.Unauthorized('Invalid cookieToken')

	const enabled = isUser2FAEnabled(payload.user_id)
	return reply.code(200).send({ enabled })
}

export async function get2FAStatusInternalController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const { user_id } = req.params as { user_id: number }
	const enabled = isUser2FAEnabled(user_id)
	return reply.code(200).send({ two_fa_enabled: enabled })
}
