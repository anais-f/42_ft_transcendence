import { IApiResponse } from '../types/api.js'

export async function loginAPI(
	username: string,
	password: string
): Promise<IApiResponse> {
	try {
		const res = await fetch('/auth/api/login', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ login: username, password })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Login failed',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function registerAPI(
	username: string,
	password: string
): Promise<IApiResponse> {
	try {
		const res = await fetch('/auth/api/register', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ login: username, password })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Registration failed',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function logoutAPI(): Promise<IApiResponse> {
	try {
		const res = await fetch('/auth/api/logout', {
			method: 'POST',
			credentials: 'include'
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Logout failed',
				status: errorData.statusCode || res.status
			}
		}

		return { data: null, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export const loginWithGoogleCredential = async (
	credential: string
): Promise<IApiResponse> => {
	try {
		const res = await fetch('/auth/api/login-google', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ credential })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Google login failed',
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
 * Load Google Identity Services script dynamically
 * Necessary for Google OAuth login
 * @returns Promise that resolves when the script is loaded
 */
export const loadGoogleScript = (): Promise<void> => {
	return new Promise((resolve, reject) => {
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
