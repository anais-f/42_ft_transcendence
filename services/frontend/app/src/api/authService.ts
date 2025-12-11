import { IPrivateUser } from '@ft_transcendence/common'

/**
 * Check if user is authenticated by calling backend
 * JWT is in httpOnly cookie, sent automatically with credentials: 'include'
 */
export async function checkAuth(): Promise<IPrivateUser | null> {
	try {
		const response = await fetch('/users/api/users/me', {
			method: 'GET',
			credentials: 'include'
		})

		if (!response.ok) return null

		const user = (await response.json()) as IPrivateUser
		return user
	} catch (error) {
		console.error('Auth check failed:', error)
		return null
	}
}

/**
 * Logout user
 */
export async function logout(): Promise<boolean> {
	try {
		const response = await fetch('/auth/api/logout', {
			method: 'POST',
			credentials: 'include'
		})

		return response.ok
	} catch (error) {
		console.error('Logout failed:', error)
		return false
	}
}
