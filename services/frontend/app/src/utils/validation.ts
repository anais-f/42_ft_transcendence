import { UsernameSchema } from '@common/DTO/usersSchema.js'
import { PasswordSchema } from '@common/DTO/authSchema.js'
import { checkAuth } from '../usecases/userSession.js'
import { setCurrentUser } from '../usecases/userStore.js'
import { notyfGlobal as notyf } from '../utils/notyf.js'

export async function handleAuthSuccess(successMessage: string) {
  const authResult = await checkAuth()
  setCurrentUser(authResult)
  notyf.success(successMessage)
  await window.navigate('/', true)
}

export function validateUsername(username: unknown) {
	const validation = UsernameSchema.safeParse(username?.toString())
  if (!validation.success) {
    const errorMessage = validation.error.issues?.[0]?.message || 'Login must be 4-32 characters long and can include letters, numbers, underscores, and hyphens'
    return { success: false, error: errorMessage }
	}
	return { success: true, data: validation.data }
}

export function validatePassword(password: unknown) {
	const validation = PasswordSchema.safeParse(password?.toString())
	if (!validation.success) {
		const errorMessage = validation.error.issues?.[0]?.message || 'Password must be 8-128 characters long and include at least one letter and one number'
		return { success: false, error: errorMessage }
	}
	return { success: true, data: validation.data }
}

