/**
 * Escape the HTML special characters in a string to prevent XSS attacks.
 * @param unsafe
 * @returns The escaped string.
 */
export function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}

/**
 * Sanitize an avatar URL to prevent XSS attacks.
 * @param url
 * @returns The sanitized URL or a default avatar URL.
 */
export function sanitizeAvatarUrl(url: string): string {
	const DEFAULT_AVATAR = '/assets/images/avatar.png'

	if (!url || url.trim() === '') return DEFAULT_AVATAR

	const lower = url.toLowerCase()

	const dangerous = ['javascript:', 'data:', 'file:', 'vbscript:', 'blob:']
	for (const protocole of dangerous) {
		if (lower.startsWith(protocole)) {
			console.warn('Dangerous URL blocked: ', url)
			return DEFAULT_AVATAR
		}
	}

	const formatValide =
		url.startsWith('http://') ||
		url.startsWith('https://') ||
		url.startsWith('/')

	if (!formatValide) {
		console.warn('Invalid URL format:', url)
		return DEFAULT_AVATAR
	}
	return url
}
