import {
	updateUsernameAPI,
	updateAvatarAPI,
	changePasswordAPI
} from '../api/settingsApi.js'
import { notyfGlobal as notyf } from '../utils/notyf.js'
import {
	validateUsername,
	validatePassword,
	validateAvatarFile,
	syncCurrentUser
} from '../utils/userValidation.js'

/**
 * Handler for changing username
 * @param form
 * @return void
 */
export async function handleUsername(form: HTMLFormElement) {
	const formData = new FormData(form)
	const newUsername = formData.get('change_username') as string

	if (!newUsername) {
		notyf.error('Username cannot be empty')
		return
	}

	const usernameResult = validateUsername(newUsername)
	if (!usernameResult.success) {
		notyf.error(usernameResult.error)
		return
	}

	const { data, error, status } = await updateUsernameAPI(usernameResult.data)

	if (error) {
		switch (status) {
			case 0:
				notyf.error('Network error, check your connection username')
				break
			default:
				notyf.error(error)
		}
		form.reset()
		return
	}

	if (!(await syncCurrentUser('Failed to update username'))) return

	notyf.success('Username changed successfully!')
	form.reset()
}

/**
 * Handler for changing avatar
 * @param form
 * @return void
 */
export async function handlerAvatar(form: HTMLFormElement) {
	const formData = new FormData(form)
	const avatarFile = formData.get('avatar') as File

	const avatarResult = validateAvatarFile(avatarFile)
	if (!avatarResult.success) {
		notyf.error(avatarResult.error)
		return
	}

	const { data, error, status } = await updateAvatarAPI(avatarResult.data)

	if (error) {
		switch (status) {
			case 0:
				notyf.error('Network error, check your connection avatr')
				break
			default:
				notyf.error(error)
		}
		form.reset()
		return
	}

	if (!(await syncCurrentUser('Failed to update avatar'))) return

	notyf.success('Avatar changed successfully!')
	form.reset()
}

/**
 * Handler for changing password
 * @param form
 * @return void
 */
export async function handleChangePassword(form: HTMLFormElement) {
	const formData = new FormData(form)
	const oldPassword = formData.get('old_password') as string
	const newPassword = formData.get('new_password') as string
	const confirmNewPassword = formData.get('confirm_new_password') as string
	const twofaCode = formData.get('password_2fa_code') as string | null

	if (!oldPassword || !newPassword || !confirmNewPassword) {
		notyf.error('Please fill in all password fields')
		return
	}

	if (newPassword !== confirmNewPassword) {
		notyf.error('New password and confirmation do not match')
		return
	}

	if (oldPassword === newPassword) {
		notyf.error('New password must be different from the old password')
		return
	}

	const oldPasswordResult = validatePassword(oldPassword)
	if (!oldPasswordResult.success) {
		notyf.error('Invalid old password: ' + oldPasswordResult.error)
		return
	}

	const newPasswordResult = validatePassword(newPassword)
	if (!newPasswordResult.success) {
		notyf.error('Invalid new password: ' + newPasswordResult.error)
		return
	}

	const { data, error, status } = await changePasswordAPI(
		oldPasswordResult.data,
		newPasswordResult.data,
		twofaCode || undefined
	)

	if (error) {
		switch (status) {
			case 0:
				notyf.error('Network error, check your connection mot de passe')
				break
			default:
				notyf.error(error)
		}
		form.reset()
		return
	}

	notyf.success('Password changed successfully!')
	form.reset()
}
