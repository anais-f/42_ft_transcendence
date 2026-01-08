import {
	createUser,
	findUserByLogin,
	createAdminUser,
	createGoogleUser
} from '../repositories/userRepository.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signToken } from '../utils/jwt.js'
import {
	failedLoginAttemptsCounter,
	successfulLoginCounter
} from '@ft_transcendence/monitoring'
import { status2FA } from './twofa.js'

export async function registerAdminUser(login: string, password: string) {
	const hashed = await hashPassword(password)
	createAdminUser(login, hashed)
	return { success: true }
}

export async function registerUser(login: string, password: string) {
	const hashed = await hashPassword(password)
	createUser(login, hashed)
	return { success: true }
}

// TODO : why return null ? we can't throw an error here ?
// TODO : typing of return value
export async function loginUser(login: string, password: string) {
	if (!password) return null
	const user = findUserByLogin(login)
	if (!user || !user.password) return null
	const ok = await verifyPassword(user.password, password)
	if (!ok) {
		failedLoginAttemptsCounter.inc({ username: login })
		return null
	}
	successfulLoginCounter.inc()
	const isAdmin = Boolean(user.is_admin)
	const is2FAEnabled = await status2FA(user.user_id)
	if (!is2FAEnabled.enabled) {
		return {
			token: signToken(
				{
					user_id: user.user_id,
					login: user.login,
					is_admin: isAdmin,
					type: 'auth'
				},
				'4h'
			)
		}
	} else {
		return {
			pre_2fa_token: signToken(
				{
					user_id: user.user_id,
					login: user.login,
					is_admin: isAdmin,
					type: '2fa'
				},
				'5m'
			)
		}
	}
}

export async function registerGoogleUser(google_id: string) {
	createGoogleUser(google_id)
	return { success: true }
}

export function generateUsername(name: string): string {
	let username =
		name
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^\w-]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '')
			.substring(0, 32) || 'user'
	if (username.length < 4) {
		username = username.padEnd(4, '-')
	}
	return username
}
