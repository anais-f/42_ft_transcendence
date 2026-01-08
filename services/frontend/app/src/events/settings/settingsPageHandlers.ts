import {
	updateUsernameAPI,
	updateAvatarAPI,
	changePasswordAPI
} from '../../api/settingsApi.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import {
	validateUsername,
	validatePassword,
	validateAvatarFile,
	syncCurrentUser
} from '../../usecases/userValidation.js'
import { ToastActionType } from '../../types/toast.js'

export async function handleUsername(form: HTMLFormElement) {
	const formData = new FormData(form)
	const newUsername = formData.get('change_username') as string

	if (!newUsername) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'Username cannot be empty'
		})
		form.reset()
		return
	}

	const usernameResult = validateUsername(newUsername)
	if (!usernameResult.success) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: usernameResult.error
		})
		form.reset()
		return
	}

	const { data, error, status } = await updateUsernameAPI(usernameResult.data)

	if (error) {
		switch (status) {
			case 0:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: 'Network error, check your connection username'
				})
				break
			default:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: error
				})
		}
		form.reset()
		return
	}

	if (!(await syncCurrentUser('Failed to update username'))) return

	notyf.open({
		type: ToastActionType.SUCCESS_ACTION,
		message: 'Username changed successfully!'
	})
	form.reset()
}

export async function handlerAvatar(form: HTMLFormElement) {
	const formData = new FormData(form)
	const avatarFile = formData.get('change_avatar') as File

	const avatarResult = validateAvatarFile(avatarFile)
	if (!avatarResult.success) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: avatarResult.error
		})
		form.reset()
		return
	}

	const { data, error, status } = await updateAvatarAPI(avatarResult.data)

	if (error) {
		switch (status) {
			case 0:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: 'Network error, check your connection avatar'
				})
				break
			default:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: error
				})
		}
		form.reset()
		return
	}

	if (!(await syncCurrentUser('Failed to update avatar'))) return

	notyf.open({
		type: ToastActionType.SUCCESS_ACTION,
		message: 'Avatar changed successfully!'
	})
	form.reset()
}

export async function handleChangePassword(form: HTMLFormElement) {
	const formData = new FormData(form)
	const oldPassword = formData.get('old_password') as string
	const newPassword = formData.get('new_password') as string
	const confirmNewPassword = formData.get('confirm_new_password') as string
	const twofaCode = formData.get('password_2fa_code') as string | null

	if (!oldPassword || !newPassword || !confirmNewPassword) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'Please fill in all password fields'
		})
		return
	}

	if (newPassword !== confirmNewPassword) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: "New password and confirmation don't match"
		})
		return
	}

	if (oldPassword === newPassword) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'New password must be different from the old password'
		})
		return
	}

	const oldPasswordResult = validatePassword(oldPassword)
	if (!oldPasswordResult.success) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'Invalid old password: ' + oldPasswordResult.error
		})
		return
	}

	const newPasswordResult = validatePassword(newPassword)
	if (!newPasswordResult.success) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'Invalid new password: ' + newPasswordResult.error
		})
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
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: 'Network error, check your connection password'
				})
				break
			default:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: error
				})
		}
		form.reset()
		return
	}

	notyf.open({
		type: ToastActionType.SUCCESS_ACTION,
		message: 'Password changed successfully!'
	})
	form.reset()
}
