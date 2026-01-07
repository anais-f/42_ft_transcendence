import { IApiResponse } from '../types/api.js'

export async function verify2FALoginAPI(code: string): Promise<IApiResponse> {
	try {
		const res = await fetch('/auth/api/2fa/verify-login', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ twofa_code: code })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Invalid 2FA code',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function verifyMyPasswordAPI(
	password: string
): Promise<IApiResponse> {
	try {
		const res = await fetch('/auth/api/verify-my-password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ password })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: 'Invalid password',
				status: errorData.statusCode || res.status
			}
		}

		return { data: null, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function setup2FAAPI(): Promise<IApiResponse> {
	try {
		const res = await fetch('/auth/api/2fa/setup', {
			method: 'POST',
			credentials: 'include'
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error:
					errorData.error || errorData.message || 'Failed to generate QR code',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function verifySetup2FAAPI(code: string): Promise<IApiResponse> {
	try {
		const res = await fetch('/auth/api/2fa/verify-setup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ twofa_code: code })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Invalid 2FA code',
				status: errorData.statusCode || res.status
			}
		}

		return { data: null, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function disable2FAAPI(code: string): Promise<IApiResponse> {
	try {
		const res = await fetch('/auth/api/2fa/disable', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ twofa_code: code })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Failed to disable 2FA',
				status: errorData.statusCode || res.status
			}
		}

		return { data: null, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}
