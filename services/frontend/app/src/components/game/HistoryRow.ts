/**
 * Renders a single line in the game history table.
 * @param props - The properties for the game history line.
 * @param props.date - The date of the game.
 * @param props.player1 - The name of player 1.
 * @param props.score1 - The score of player 1.
 * @param props.score2 - The score of player 2.
 * @param props.player2 - The name of player 2.
 * @param props.result - The result of the game ('Win' or 'Loss').
 * @returns A string representing a table row in HTML.
 */
interface GameHistoryProps {
  date: string;
  result: 'Win' | 'Loss';
  player1: string;
  score1: number;
  score2: number;
  player2: string;
}

/**
 * GameHistoryRow component to render a single row in the game history table.
 * @param props
 * @constructor
 */
export const GameHistoryRow = (props: GameHistoryProps): string => {
  const {date, player1, score1, score2, player2, result} = props;
  const resultColor = result === 'Win' ? 'text-emerald-900' : 'text-rose-900';

  const baseClass = 'border-y border-black px-2 text-center';

  return /*html*/ `
    <tr>
      <td class="${baseClass} text-lg">${date}</td>
      <td class="${baseClass} ${resultColor} font-bold text-lg">${result}</td>
      <td class="${baseClass}">
        <p class="truncate min-w-0">${player1}</p>
        <p>${</p>
      </td>
      <td class="${baseClass}">
        <p class="truncate min-w-0">${player2}</p>
        <p>${score2}</p>
      </td>
    </tr>
  `

}
