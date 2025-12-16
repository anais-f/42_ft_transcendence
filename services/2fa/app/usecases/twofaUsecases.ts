import { authenticator } from 'otplib'
import { encryptSecret, decryptSecret } from '../utils/crypto.js'
import {
	upsertPendingSecret,
	getPendingSecretEnc,
	activateSecret,
	deleteSecret,
	getSecretEnc
} from '../repositories/twofaRepository.js'
import qrcode from 'qrcode'
import createHttpError from 'http-errors'
import type {
	Setup2FAResponseDTO,
	Verify2FAResponseDTO,
	Disable2FAResponseDTO,
	Status2FAResponseDTO
} from '@ft_transcendence/common'

const SETUP_EXPIRATION_MS = 5 * 60 * 1000 // 5 minutes

export async function setup2FA(
	userId: number,
	issuer: string,
	label: string
): Promise<Setup2FAResponseDTO> {
	console.log(`[2FA] Setting up 2FA for user ${userId}`)
	const secret = authenticator.generateSecret()
	const enc = encryptSecret(secret)
	const pendingUntil = Date.now() + SETUP_EXPIRATION_MS

	upsertPendingSecret(userId, enc, pendingUntil)
	console.log(
		`[2FA] Pending secret saved for user ${userId}, expires at ${new Date(pendingUntil).toISOString()}`
	)

	const otpauth_url = authenticator.keyuri(label, issuer, secret)
	const qr_base64 = await qrcode.toDataURL(otpauth_url)

	return {
		otpauth_url,
		qr_base64,
		expires_at: new Date(pendingUntil).toISOString()
	}
}

export function verify2FA(
	userId: number,
	twofaCode: string
): Verify2FAResponseDTO {
	console.log(`[2FA] Verifying 2FA for user ${userId}`)
	const pending = getPendingSecretEnc(userId)

	if (pending) {
		console.log(`[2FA] Found pending secret for user ${userId}`)

		if (pending.pending_until && Date.now() > pending.pending_until) {
			console.log(`[2FA] Setup expired for user ${userId}`)
			deleteSecret(userId)
			throw createHttpError.Gone('Setup expired')
		}

		const secret = decryptSecret(pending.secret_enc)
		const isValid = authenticator.check(twofaCode, secret)

		if (!isValid) {
			throw createHttpError.Unauthorized('Invalid code')
		}

		const activated = activateSecret(userId)
		if (!activated) {
			console.warn(`Failed to activate 2FA secret for user ${userId}`)
		}

		return { success: true, activated: true }
	}

	console.log(
		`[2FA] No pending secret, checking active secret for user ${userId}`
	)
	const activeEnc = getSecretEnc(userId)
	if (!activeEnc) {
		console.log(`[2FA] No active secret found for user ${userId}`)
		throw createHttpError.NotFound('No 2FA secret')
	}
	console.log(`[2FA] Found active secret for user ${userId}`)

	const activeSecret = decryptSecret(activeEnc)
	const isValid = authenticator.check(twofaCode, activeSecret)

	if (!isValid) {
		throw createHttpError.Unauthorized('Invalid code')
	}

	return { success: true, activated: false }
}

export function disable2FA(userId: number): Disable2FAResponseDTO {
	deleteSecret(userId)
	return { success: true }
}

export function status2FA(userId: number): Status2FAResponseDTO {
	const enc = getSecretEnc(userId)
	return { enabled: !!enc }
}
