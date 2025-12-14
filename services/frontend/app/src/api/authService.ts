import { IPrivateUser } from '@ft_transcendence/common'
import { setCurrentUser } from '../usecases/userStore.js'

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
 * Logout user, clear user state and redirect to login page
 * JWT cookie will be cleared by backend
 * @returns Promise that resolves when logout is complete
 */
export async function logout(): Promise<void> {
	// TODDO : clear websocket connections, etc.
  try {
		await fetch('/auth/api/logout', {
			method: 'POST',
			credentials: 'include'
		})
	} catch (error) {
		console.error('Logout failed:', error)
	} finally {
		setCurrentUser(null)
		window.navigate('/login', true) // skipAuth = true to avoid 401
	}
}

/**
 * Load Google Identity Services script dynamically
 * Necessary for Google OAuth login
 * @returns Promise that resolves when the script is loaded
 */
export const loadGoogleScript = (nonce?: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (document.getElementById('google-client-script')) {
			resolve()
			return
		}

		// script creation
		const script = document.createElement('script')

		// attributes
		script.src = 'https://accounts.google.com/gsi/client'
		script.id = 'google-client-script'
		script.async = true
		script.defer = true

		// resolution of promise
		script.onload = () => resolve()
		script.onerror = () => reject(new Error('Failed to load Google script'))

		// injection into DOM, after the body
		document.body.appendChild(script)
	})
}
/* reject or resolve -> indicate success or failure of loading the script */

/**
 * Login with Google credential
 * @param credential
 * @returns void
 */
export const loginWithGoogleCredential = async (
	credential: string
): Promise<void> => {
	const res = await fetch('/auth/api/login-google', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ credential })
	})

	if (!res.ok) {
		const error = await res.json()
		throw new Error(error.message || 'Google login failed')
	}
}
