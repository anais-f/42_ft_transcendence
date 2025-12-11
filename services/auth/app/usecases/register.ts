import {
	createUser,
	findUserByLogin,
	createAdminUser,
	createGoogleUser,
	isUser2FAEnabled,
	incrementSessionId,
	getSessionId
} from '../repositories/userRepository.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signToken } from '../utils/jwt.js'

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
	if (!ok) return null
	const isAdmin = Boolean(user.is_admin)

	incrementSessionId(user.user_id)
	const newSessionId = getSessionId(user.user_id) ?? 0

	if (!isUser2FAEnabled(user.user_id)) {
		return {
			token: signToken(
				{
					user_id: user.user_id,
					login: user.login,
					session_id: newSessionId,
					is_admin: isAdmin,
					type: 'auth'
				},
				'1h'
			)
		}
	} else {
		return {
			pre_2fa_token: signToken(
				{
					user_id: user.user_id,
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
