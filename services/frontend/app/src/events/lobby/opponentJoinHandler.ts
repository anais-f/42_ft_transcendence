import { PlayerData } from '../../usecases/gameStore.js'

export function opponentJoinHandler(opponent: PlayerData) {
	const avatarEl = document.getElementById(
		'opponent-avatar'
	) as HTMLImageElement | null
	const usernameEl = document.getElementById('opponent-username')

	if (avatarEl) {
		avatarEl.src = opponent.avatar
	}
	if (usernameEl) {
		usernameEl.textContent = opponent.username
	}
}
