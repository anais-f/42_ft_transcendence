export async function userIdFromUrl(): Promise<number | null> {
	const urlParts = window.location.pathname.split('/')
	const userIdStr = urlParts[2]

	if (!userIdStr) {
		return null
	}

	const userId = Number(userIdStr)
	if (isNaN(userId)) {
		return null
	}

	return userId
}
