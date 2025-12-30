import createHttpError from 'http-errors'
import {
	setUser2FAEnabled,
	isUser2FAEnabled
} from '../repositories/userRepository.js'
import { signToken } from '../utils/jwt.js'
import {
	Call2FAResponseDTO,
	Enable2FAResponseDTO,
	Verify2FALoginResponseDTO,
	Status2FAResponseDTO
} from '@ft_transcendence/common'
import { env } from '../env/checkEnv.js'

async function call2faService(
	path: string,
	body: any
): Promise<Call2FAResponseDTO> {
	try {
		const res = await fetch(`${env.TWOFA_SERVICE_URL}${path}`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: env.INTERNAL_API_SECRET
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

export async function enable2FA(
	userId: number,
	login?: string
): Promise<Enable2FAResponseDTO> {
	const issuer = env.TWOFA_ISSUER
	const label = login || String(userId)

	const { ok, status, data } = await call2faService('/api/internal/2fa/setup', {
		user_id: userId,
		issuer,
		label
	})

	if (!ok) {
		throw createHttpError(status, data.error || '2FA service error')
	}

	return {
		otpauth_url: data.otpauth_url,
		qr_base64: data.qr_base64,
		expires_at: data.expires_at
	}
}

export async function verify2FASetup(
	userId: number,
	twofaCode: string
): Promise<void> {
	const { ok, status, data } = await call2faService('/api/internal/2fa/verify', {
		user_id: userId,
		twofa_code: twofaCode
	})

	if (!ok) {
		throw createHttpError(status, data.error || '2FA service error')
	}

	setUser2FAEnabled(userId, true)
}

export async function verify2FALogin(
	userId: number,
	login: string,
	isAdmin: boolean | undefined,
	twofaCode: string
): Promise<Verify2FALoginResponseDTO> {
	const { ok, status, data } = await call2faService('/api/internal/2fa/verify', {
		user_id: userId,
		twofa_code: twofaCode
	})

	if (!ok) {
		throw createHttpError(status, data.error || '2FA service error')
	}

	setUser2FAEnabled(userId, true)

	const newToken = signToken(
		{
			user_id: userId,
			login: login,
			is_admin: isAdmin,
			type: 'auth'
		},
		'1h'
	)

	return { auth_token: newToken }
}

export async function disable2FA(
	userId: number,
	twofaCode: string
): Promise<void> {
	const verify = await call2faService('/api/internal/2fa/verify', {
		user_id: userId,
		twofa_code: twofaCode
	})

	if (!verify.ok) {
		throw createHttpError(
			verify.status,
			verify.data.error || '2FA service error'
		)
	}

	const { ok, status, data } = await call2faService('/api/internal/2fa/disable', {
		user_id: userId
	})

	if (!ok) {
		throw createHttpError(status, data.error || '2FA service error')
	}

	setUser2FAEnabled(userId, false)
}

export function status2FA(userId: number): Status2FAResponseDTO {
	const enabled = isUser2FAEnabled(userId)
	return { enabled }
}
