import { tournamentStore } from '../../usecases/tournamentStore.js'

/**
 * Renders a player card with the player's name and avatar.
 * @param props.id - The optional ID for the player card element.
 * @param props.name - The name of the player.
 * @param props.avatarUrl - The URL of the player's avatar image.
 */
interface PlayerCardProps {
	id?: string
	name: string
	avatarUrl?: string
}

export const PlayerCard = (props: PlayerCardProps): string => {
	const { id, name, avatarUrl = '/avatars/img_default.png' } = props

	return /*html*/ `
    <div class="flex flex-col items-center justify-center" id="${id ?? ''}">
    	<p class="truncate w-full text-center">${name}</p>
    	<img src="${avatarUrl}" alt="${name}" class="w-32 aspect-square object-cover">
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
	for (let i = 0; i < 4; i++) {
		const player = tournamentStore.getPlayer(i)
		const cardId = `${playerCardPrefix}${i}`

		if (player) {
			updatePlayerCard(cardId, player.username, player.avatar)
		} else {
			updatePlayerCard(cardId, 'Waiting...', '/assets/images/loading.png')
		}
	}
}
