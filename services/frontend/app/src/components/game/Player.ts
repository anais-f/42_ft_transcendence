import { LivesComp } from './Lives.js'

/**
 * Renders a player component with username, avatar, and lives.
 * @param props.username - The username of the player.
 * @param props.avatar - The URL of the player's avatar image.
 * @param props.livesID - The ID for the lives component ('my-lives' or 'opponent-lives').
 * @param props.maxLives - The maximum number of lives the player can have.
 * @param props.currentLives - The current number of lives the player has.
 * @param props.additionalClasses - Additional CSS classes to apply to the player container.
 */
interface PlayerProps {
	username: string
	avatar: string
	livesID: 'my-lives' | 'opponent-lives'
	maxLives: number
	currentLives: number
	additionalClasses?: string
}

export const PlayerComp = (props: PlayerProps): string => {
	const {
		username,
		avatar,
		livesID,
		maxLives,
		currentLives,
		additionalClasses = ''
	} = props

	const baseClasses = 'flex flex-col items-center justify-center'
	const classes = `${baseClasses} ${additionalClasses}`.trim()

	return /*html*/ `
    <div class="${classes}">
      <h1 class="text-xl text-center w-fit px-2 line-clamp">${username}</h1>
      ${LivesComp({ max: maxLives, current: currentLives, livesID, additionalClasses: 'mb-4', size: 5 })}
      <img
        src="${avatar}"
        alt="${username}"
        class="w-full aspect-square object-cover object-center select-none border-solid border-2 border-black rounded"
      >
    </div>
  `
}
