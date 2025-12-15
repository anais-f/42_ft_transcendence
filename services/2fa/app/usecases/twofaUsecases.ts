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

/**
 * Setup 2FA for a user
 * Generates a new secret, encrypts it, stores it as pending, and returns QR code
 */
export async function setup2FA(
	userId: number,
	issuer: string,
	label: string
): Promise<Setup2FAResponseDTO> {
	const secret = authenticator.generateSecret()
	const enc = encryptSecret(secret)
	const pendingUntil = Date.now() + SETUP_EXPIRATION_MS

	upsertPendingSecret(userId, enc, pendingUntil)

	const otpauth_url = authenticator.keyuri(label, issuer, secret)
	const qr_base64 = await qrcode.toDataURL(otpauth_url)

	return {
		otpauth_url,
		qr_base64,
		expires_at: new Date(pendingUntil).toISOString()
	}
}

/**
 * Verify 2FA code during setup (activation) or login
 * Returns whether the code was valid and if it resulted in activation
 */
export function verify2FA(
	userId: number,
	twofaCode: string,
	hasAuthToken: boolean,
	has2FAToken: boolean
): Verify2FAResponseDTO {
	// Try pending secret first (setup/activation flow)
	const pending = getPendingSecretEnc(userId)

	if (pending) {
		if (!hasAuthToken) {
			throw createHttpError.Unauthorized('Auth token missing')
		}

		if (pending.pending_until && Date.now() > pending.pending_until) {
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

	// Try active secret (login flow)
	const activeEnc = getSecretEnc(userId)
	if (!activeEnc) {
		throw createHttpError.NotFound('No 2FA secret')
	}

	if (!has2FAToken) {
		throw createHttpError.Unauthorized('2FA token missing')
	}

	const activeSecret = decryptSecret(activeEnc)
	const isValid = authenticator.check(twofaCode, activeSecret)

	if (!isValid) {
		throw createHttpError.Unauthorized('Invalid code')
	}

	return { success: true, activated: false }
}

/**
 * Disable 2FA for a user
 * Removes both pending and active secrets
 */
export function disable2FA(userId: number): Disable2FAResponseDTO {
	deleteSecret(userId)
	return { success: true }
}

/**
 * Check if 2FA is enabled for a user
 */
export function status2FA(userId: number): Status2FAResponseDTO {
	const enc = getSecretEnc(userId)
	return { enabled: !!enc }
}
