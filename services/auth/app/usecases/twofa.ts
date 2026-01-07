import createHttpError from 'http-errors'
import { signToken } from '../utils/jwt.js'
import {
	Enable2FAResponseDTO,
	Verify2FALoginResponseDTO,
	Status2FAResponseDTO,
	Setup2FADTO,
	Verify2FADTO,
	Disable2FADTO,
	Status2FADTO,
	Setup2FAResponseDTO,
	Verify2FAResponseDTO,
	Disable2FAResponseDTO
} from '@ft_transcendence/common'
import { env } from '../env/checkEnv.js'

type Call2FABody = Setup2FADTO | Verify2FADTO | Disable2FADTO | Status2FADTO

interface Call2FAErrorResponse {
	error?: string
}

interface Call2FAResult<T> {
	ok: boolean
	status: number
	data: T | Call2FAErrorResponse
}

function isErrorResponse(data: unknown): data is Call2FAErrorResponse {
	return (
		typeof data === 'object' &&
		data !== null &&
		('error' in data || Object.keys(data).length === 0)
	)
}

function getErrorMessage(data: unknown): string {
	if (isErrorResponse(data) && data.error) {
		return data.error
	}
	return '2FA service error'
}

async function call2faService<T>(
	path: string,
	body: Call2FABody
): Promise<Call2FAResult<T>> {
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
	} catch (e) {
		if (
			e instanceof Error &&
			(e.name === 'TimeoutError' || e.name === 'AbortError')
		) {
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

	const { ok, status, data } = await call2faService<Setup2FAResponseDTO>(
		'/api/internal/2fa/setup',
		{
			user_id: userId,
			issuer,
			label
		}
	)

	if (!ok || isErrorResponse(data)) {
		throw createHttpError(status, getErrorMessage(data))
	}

	return {
		otpauth_url: data.otpauth_url,
		qr_base64: data.qr_base64,
		expires_at: data.expires_at
	}
}

export async function verify2FALogin(
	userId: number,
	login: string,
	isAdmin: boolean | undefined,
	twofaCode: string
): Promise<Verify2FALoginResponseDTO> {
	const { ok, status, data } = await call2faService<Verify2FAResponseDTO>(
		'/api/internal/2fa/verify',
		{
			user_id: userId,
			twofa_code: twofaCode
		}
	)

	if (!ok || isErrorResponse(data)) {
		throw createHttpError(status, getErrorMessage(data))
	}

	const newToken = signToken(
		{
			user_id: userId,
			login: login,
			is_admin: isAdmin,
			type: 'auth'
		},
		'4h'
	)

	return { auth_token: newToken }
}

export async function disable2FA(
	userId: number,
	twofaCode: string
): Promise<void> {
	const verify = await call2faService<Verify2FAResponseDTO>(
		'/api/internal/2fa/verify',
		{
			user_id: userId,
			twofa_code: twofaCode
		}
	)

	if (!verify.ok || isErrorResponse(verify.data)) {
		throw createHttpError(verify.status, getErrorMessage(verify.data))
	}

	const { ok, status, data } = await call2faService<Disable2FAResponseDTO>(
		'/api/internal/2fa/disable',
		{
			user_id: userId
		}
	)

	if (!ok || isErrorResponse(data)) {
		throw createHttpError(status, getErrorMessage(data))
	}
}

export async function status2FA(userId: number): Promise<Status2FAResponseDTO> {
	const { ok, status, data } = await call2faService<Status2FAResponseDTO>(
		'/api/internal/2fa/status',
		{
			user_id: userId
		}
	)

	if (!ok || isErrorResponse(data)) {
		throw createHttpError(status, getErrorMessage(data))
	}

	return { enabled: data.enabled }
}

export async function verify2FASetup(
	userId: number,
	twofaCode: string
): Promise<void> {
	const { ok, status, data } = await call2faService<Verify2FAResponseDTO>(
		'/api/internal/2fa/verify',
		{
			user_id: userId,
			twofa_code: twofaCode
		}
	)

	if (!ok || isErrorResponse(data)) {
		throw createHttpError(status, getErrorMessage(data))
	}
}
