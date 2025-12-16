import { logoutAPI } from '../api/authApi.js'
import { setCurrentUser } from './userStore.js'
import { IPrivateUser } from '@ft_transcendence/common'

/**
 * Check if user is authenticated by calling backend
 * JWT is in httpOnly cookie, sent automatically with credentials: 'include'
 * @returns Promise that resolves to IPrivateUser if authenticated, null otherwise
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
 * Cleanup all user session data
 * Called when user logs out or session expires
 */
export function cleanupUserSession() {
	// TODO: close websocket connections
	// closeWebsockets()

	setCurrentUser(null)

	// TODO: clear any other session data if needed
	// localStorage.clear()
}

/**
 * Logout user completely
 * - Calls logout API endpoint
 * - Cleans up all session data (websockets, user state, etc.)
 * - Redirects to login page
 * Can be called from:
 * - Logout button click
 * - Session timeout
 * - 401 error interceptor
 * - Any other logout trigger
 */
export async function logout() {
	const { error } = await logoutAPI()

	if (error) {
		console.error('Logout API failed:', error)
		// Continue with cleanup even if API fails
	}

	cleanupUserSession()
	window.navigate('/login', true) // skipAuth = true to avoid 401
}
