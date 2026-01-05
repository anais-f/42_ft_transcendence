import { escapeHtml } from '../../usecases/sanitize.js'
import { LivesComp, updateLives } from '../game/Lives.js'

interface TournamentCellProps {
	id: string
	name: string
	score?: number
	maxScore?: number
	additionalClasses?: string
}

export const TournamentCell = (props: TournamentCellProps): string => {
	const { id, name, score, maxScore = 5, additionalClasses = '' } = props
	const safeName = escapeHtml(name)

	return /*html*/ `
	<div class="px-2 w-full flex justify-between items-center border-black ${additionalClasses}">
		<span id="${id}" class="truncate">${safeName}</span>
		${score !== undefined ? LivesComp({ livesID: `${id}-score`, current: score, max: maxScore, size: 3 }) : ''}
	</div>
  `
}

export function updateTournamentCellName(id: string, name: string): void {
	const element = document.getElementById(id)
	if (element) {
		element.textContent = name
	}
}

export function updateTournamentCellScore(
	id: string,
	score: number,
	maxScore: number = 5
): void {
	updateLives(`${id}-score`, score, maxScore, 3)
}
