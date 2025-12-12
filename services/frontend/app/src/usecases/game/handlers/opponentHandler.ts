import { fetchUserById } from '../../../api/usersService.js'

export async function opponentHandler(data: unknown) {
	const { id } = data as { id: number }
	const opponent = await fetchUserById(id)
	if (!opponent) {
		console.error('Failed to fetch opponent data')
		return
	}

	const avatarEl = document.getElementById('opponent-avatar') as HTMLImageElement | null
	const usernameEl = document.getElementById('opponent-username')

	if (avatarEl) {
		avatarEl.src = opponent.avatar
	}
	if (usernameEl) {
		usernameEl.textContent = opponent.username
	}
}
