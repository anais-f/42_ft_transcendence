/**
 * Verify 2FA code during login
 * @param code - 6-digit 2FA code
 * @returns Promise with result containing data, error and status
 */
export async function verify2FALoginAPI(code: string) {
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
			const error = await res.json()
			return {
				data: null,
				error: error.message || 'Invalid 2FA code',
				status: error.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}