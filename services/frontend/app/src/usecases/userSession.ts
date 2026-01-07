import { logoutAPI } from '../api/authApi.js'
import { setCurrentUser } from './userStore.js'
import { IPrivateUser } from '@ft_transcendence/common'
import { socialStore } from './socialStore.js'

export async function checkAuth(): Promise<IPrivateUser | null> {
	try {
		const response = await fetch('/users/api/users/me', {
			method: 'GET',
			credentials: 'include'
		})

		if (!response.ok) return null

		return (await response.json()) as IPrivateUser
	} catch (error) {
		console.error('Auth check failed:', error)
		return null
	}
}

export async function logout() {
	await logoutAPI()

	socialStore.clear()
	setCurrentUser(null)

	window.navigate('/login', { skipAuth: true })
}
