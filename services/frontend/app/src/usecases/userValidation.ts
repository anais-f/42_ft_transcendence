import { UsernameSchema } from '@common/DTO/usersSchema.js'
import { PasswordSchema } from '@common/DTO/authSchema.js'
import { checkAuth } from './userSession.js'
import { setCurrentUser } from './userStore.js'
import { notyfGlobal as notyf } from '../utils/notyf.js'
import { ToastActionType } from '../types/toast.js'

export async function handleAuthSuccess(successMessage: string) {
	const authResult = await checkAuth()
	setCurrentUser(authResult)
	notyf.open({
		type: ToastActionType.SUCCESS_ACTION,
		message: successMessage
	})
	await window.navigate('/', { skipAuth: true })
}

export async function syncCurrentUser(errorMessage?: string): Promise<boolean> {
	const updatedUser = await checkAuth()
	if (!updatedUser) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: errorMessage || 'Failed to fetch updated user data'
		})
		return false
	}
	setCurrentUser(updatedUser)
	return true
}

export function validateUsername(username: unknown) {
	const validation = UsernameSchema.safeParse(username?.toString())
	if (!validation.success) {
		const errorMessage =
			validation.error.issues?.[0]?.message ||
			'Login must be 4-32 characters long and can include letters, numbers, underscores, and hyphens'
		return { success: false, error: errorMessage }
	}
	return { success: true, data: validation.data }
}

export function validatePassword(password: unknown) {
	const validation = PasswordSchema.safeParse(password?.toString())
	if (!validation.success) {
		const errorMessage =
			validation.error.issues?.[0]?.message ||
			'Password must be 8-128 characters long and include at least one letter and one number'
		return { success: false, error: errorMessage }
	}
	return { success: true, data: validation.data }
}

export function validateAvatarFile(file: File) {
	const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
	const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

	if (!file || !(file instanceof File)) {
		return { success: false, error: 'Please select a valid file' }
	}

	if (file.size > MAX_FILE_SIZE) {
		return { success: false, error: 'File size must be less than 5MB' }
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return { success: false, error: 'File must be an image (JPEG, JPG or PNG)' }
	}

	return { success: true, data: file }
}
