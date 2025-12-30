import createHttpError from 'http-errors'
import {
	findUserById,
	isUser2FAEnabled,
	changeUserPassword
} from '../repositories/userRepository.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { env } from '../env/checkEnv.js'

/**
 * Verify a 2FA code by calling the 2FA service
 * @param userId - The user ID
 * @param twofaCode - The 6-digit 2FA code
 * @returns true if valid, throws error otherwise
 */
async function verify2FACode(
	userId: number,
	twofaCode: string
): Promise<boolean> {
	try {
		const res = await fetch(`${env.TWOFA_SERVICE_URL}/api/internal/2fa/verify`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: env.INTERNAL_API_SECRET
			},
			body: JSON.stringify({
				user_id: userId,
				twofa_code: twofaCode
			}),
			signal: AbortSignal.timeout(5000)
		})

		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			throw createHttpError(res.status, data.error || 'Invalid 2FA code')
		}

		return true
	} catch (e: any) {
		if (e.name === 'TimeoutError' || e.name === 'AbortError') {
			throw createHttpError.GatewayTimeout('2FA service timeout')
		}
		// Re-throw if it's already an HTTP error
		if (e.statusCode || e.status) {
			throw e
		}
		throw createHttpError.ServiceUnavailable('2FA service unavailable')
	}
}

/**
 * Change user password with old password verification and optional 2FA
 * @param userId - The user ID
 * @param oldPassword - The current password
 * @param newPassword - The new password
 * @param twofaCode - Optional 2FA code (required if 2FA is enabled)
 * @returns success boolean
 */
export async function changeMyPassword(
	userId: number,
	oldPassword: string,
	newPassword: string,
	twofaCode?: string
): Promise<boolean> {
	const user = findUserById(userId)
	if (!user || !user.password) {
		throw createHttpError.NotFound('User not found')
	}

	if (oldPassword === newPassword) {
		throw createHttpError.UnprocessableEntity(
			'New password must be different from old password'
		)
	}

	const isOldPasswordValid = await verifyPassword(user.password, oldPassword)
	if (!isOldPasswordValid) {
		throw createHttpError.Unauthorized('Invalid old password')
	}

	if (isUser2FAEnabled(userId)) {
		if (!twofaCode) {
			throw createHttpError.BadRequest('2FA code required')
		}
		await verify2FACode(userId, twofaCode)
	}

	const hashedNewPassword = await hashPassword(newPassword)
	const ok = changeUserPassword(userId, hashedNewPassword)

	if (!ok) {
		throw createHttpError.InternalServerError('Failed to update password')
	}

	return true
}
