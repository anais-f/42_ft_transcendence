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

/**
 * Charge le script Google Identity Services dynamiquement
 * Cela évite de le mettre dans le index.html et de ralentir tout le site
 */
export const loadGoogleScript = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		// Si le script est déjà là, on ne fait rien
		if (document.getElementById('google-client-script')) {
			resolve()
			return
		}

		const script = document.createElement('script')
		script.src = 'https://accounts.google.com/gsi/client'
		script.id = 'google-client-script'
		script.async = true
		script.defer = true

		script.onload = () => resolve()
		script.onerror = () => reject(new Error('Failed to load Google script'))

		document.body.appendChild(script)
	})
}

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
