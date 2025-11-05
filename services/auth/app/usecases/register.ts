import { createUser, findUserByLogin, createGoogleUser } from '../repositories/userRepository.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signToken } from '../utils/jwt.js'

export async function registerUser(login: string, password: string) {
	const hashed = await hashPassword(password)
	await createUser(login, hashed)
	return { success: true }
}

export async function loginUser(login: string, password: string) {
	if (!password) return null
	const user = await findUserByLogin(login)
	if (!user || !user.password) return null
	const ok = await verifyPassword(user.password, password)
	if (!ok) return null
	return { token: signToken({ userId: user.user_id, login: user.login }) }
}

export async function registerGoogleUser(google_id: string) {
	await createGoogleUser(google_id)
	return { success: true }
}
