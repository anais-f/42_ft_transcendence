import { LivesComp } from './Lives.js'
import { UserLink } from '../friends/UserLink.js'

/**
 * Renders a single line in the game history table.
 * @param props.date - The date of the game.
 * @param props.player1 - The name of player 1.
 * @param props.player1Id - The ID of player 1.
 * @param props.score1 - The score of player 1.
 * @param props.score2 - The score of player 2.
 * @param props.player2 - The name of player 2.
 * @param props.player2Id - The ID of player 2.
 * @param props.result - The result of the game ('Win' or 'Loss').
 */
interface GameHistoryProps {
	date: string
	result: 'Win' | 'Loss'
	player1: string
	player1Id: number
	score1: number
	score2: number
	player2: string
	player2Id: number
}

export const GameHistoryRow = (props: GameHistoryProps): string => {
	const {
		date,
		player1,
		player1Id,
		score1,
		score2,
		player2,
		player2Id,
		result
	} = props
	const resultColor = result === 'Win' ? 'text-emerald-900' : 'text-rose-900'

	const baseClass = 'border-b border-black py-2 text-center'

	return /*html*/ `
    <tr class="flex w-full">
      <td class="${baseClass} text-lg w-32 flex items-center justify-center">${date}</td>
      <td class="${baseClass} ${resultColor} font-bold text-lg w-24 flex items-center justify-center">${result}</td>
      <td class="${baseClass} flex-1 overflow-hidden min-w-0">
        ${UserLink({ id: String(player1Id), username: player1 })}
        <p>${LivesComp({ max: 5, current: score1, livesID: '', size: 3, additionalClasses: 'mx-auto' })}</p>
      </td>
      <td class="${baseClass} flex-1 overflow-hidden min-w-0">
        ${UserLink({ id: String(player2Id), username: player2 })}
        <p>${LivesComp({ max: 5, current: score2, livesID: '', size: 3, additionalClasses: 'mx-auto' })}</p>
      </td>
    </tr>
  `
}
