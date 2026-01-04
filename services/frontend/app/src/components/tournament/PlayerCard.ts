import { escapeHtml } from '../../usecases/sanitize.js'
import { tournamentStore } from '../../usecases/tournamentStore.js'

interface PlayerCardProps {
	id?: string
	name: string
	avatarUrl?: string
}

export const PlayerCard = (props: PlayerCardProps): string => {
	const { id, name, avatarUrl = '/avatars/img_default.png' } = props
	const safeName = escapeHtml(name)

	return /*html*/ `
    <div class="flex flex-col items-center justify-center" id="${id ?? ''}">
    	<p class="truncate w-full text-center">${safeName}</p>
    	<img src="${avatarUrl}" alt="${safeName}" class="w-32 aspect-square object-cover">
    </div>
  `
}

export const updatePlayerCard = (
	id: string,
	name: string,
	avatar: string
): void => {
	const card = document.getElementById(id)
	if (card) {
		card.innerHTML = `
      <p class="truncate w-full text-center">${name}</p>
    	<img src="${avatar}" alt="${name}" class="w-32 aspect-square object-cover">
    `
	}
}

export function updateAllPlayerCards(playerCardPrefix: string) {
	const players = tournamentStore.players

	for (let i = 0; i < 4; i++) {
		const player = players[i]
		const cardId = `${playerCardPrefix}${i}`

		if (player) {
			updatePlayerCard(cardId, player.username, player.avatar)
		} else {
			updatePlayerCard(cardId, 'Waiting...', '/assets/images/loading.png')
		}
	}
}
