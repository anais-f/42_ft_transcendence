import { LivesComp } from './Lives.js'
import { escapeHtml, sanitizeAvatarUrl } from '../../usecases/sanitize.js'

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

	// Sanitize user inputs
	const safeUsername = escapeHtml(username)
	const safeAvatar = sanitizeAvatarUrl(avatar)

	const baseClasses = 'flex flex-col items-center justify-center'
	const classes = `${baseClasses} ${additionalClasses}`.trim()

	return /*html*/ `
    <div class="${classes}">
      <h1 class="text-xl text-center w-fit px-2 line-clamp">${safeUsername}</h1>
      ${LivesComp({ max: maxLives, current: currentLives, livesID, additionalClasses: 'mb-4', size: 5 })}
      <img
        src="${safeAvatar}"
        alt="${safeUsername}"
        class="w-full aspect-square object-cover object-center select-none border-solid border-2 border-black rounded"
      >
    </div>
  `
}
