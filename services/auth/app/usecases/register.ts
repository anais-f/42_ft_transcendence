import {
	createUser,
	findUserByLogin,
	createAdminUser,
	createGoogleUser
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

export async function loginUser(login: string, password: string) {
	if (!password) return null
	const user = findUserByLogin(login)
	if (!user || !user.password) return null
	const ok = await verifyPassword(user.password, password)
	if (!ok) return null
	const isAdmin = Boolean(user.is_admin)
	if (!user.two_fa_secret)
	{
		return {
			token: signToken({
				user_id: user.user_id,
				login: user.login,
				is_admin: isAdmin,
				type: 'auth'
			}, '1h')
		}
	}
	else {
		return {
			pre_2fa_token: signToken({
				user_id: user.user_id,
				type: '2fa'
			}, '5m')
		}
	}
}

export async function registerGoogleUser(google_id: string) {
	createGoogleUser(google_id)
	return { success: true }
}
