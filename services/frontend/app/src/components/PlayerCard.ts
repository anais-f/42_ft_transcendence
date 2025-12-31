import { escapeHtml } from '../usecases/sanitize.js'

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
