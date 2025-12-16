/**
 * Update username for current user
 * @param username - New username
 * @returns Promise with result containing data, error and status
 */
export async function updateUsernameAPI(username: string) {
	try {
		const res = await fetch('/users/api/users/me', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ username })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error:
					errorData.error || errorData.message || 'Failed to change username',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

/**
 * Upload avatar for current user
 * @param avatarFile - Avatar file to upload
 * @returns Promise with result containing data, error and status
 */
export async function updateAvatarAPI(avatarFile: File) {
	try {
		const formData = new FormData()
		formData.append('avatar', avatarFile)

		const res = await fetch('/users/api/users/me/avatar', {
			method: 'PATCH',
			credentials: 'include',
			body: formData
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error:
					errorData.error || errorData.message || 'Failed to upload avatar',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

/**
 * Change password for current user
 * @param oldPassword - Current password
 * @param newPassword - New password
 * @param twofaCode - Optional 2FA code if enabled
 * @returns Promise with result containing data, error and status
 */
export async function changePasswordAPI(
	oldPassword: string,
	newPassword: string,
	twofaCode?: string
) {
	try {
		const body: {
			old_password: string
			new_password: string
			twofa_code?: string
		} = {
			old_password: oldPassword,
			new_password: newPassword
		}

		if (twofaCode) body.twofa_code = twofaCode

		const res = await fetch('/auth/api/user/me/password', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify(body)
		})
		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error:
					errorData.error || errorData.message || 'Failed to change password',
				status: errorData.statusCode || res.status
			}
		}

		return { data: null, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}
