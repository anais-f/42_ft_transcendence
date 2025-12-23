/**
 * Extracts the user ID from the current URL.
 * Assumes the URL structure is /profile/{userId}.
 * @returns {Promise<number | null>} The user ID as a number, or null if not found or invalid.
 */
export async function userIdFromUrl(): Promise<number | null> {
	const urlParts = window.location.pathname.split('/')
	const userIdStr = urlParts[2]

	if (!userIdStr) {
		console.error('No user ID found in URL')
		return null
	}

	const userId = Number(userIdStr)
	if (isNaN(userId)) {
		console.error('Invalid user ID in URL')
		return null
	}

	return userId
}
