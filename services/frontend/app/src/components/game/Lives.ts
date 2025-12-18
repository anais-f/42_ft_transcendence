interface LivesProps {
	max: number
	current: number
	livesID: string
	additionalClasses?: string
}

export const LivesComp = (props: LivesProps): string => {
	const { max, current, livesID, additionalClasses = '' } = props

	const baseClasses = 'flex flex-wrap gap-1 items-center w-fit'
	const classes = `${baseClasses} ${additionalClasses}`.trim()

	const hearts = generateHearts(max, current)

	return /*html*/ `
    <div id="${livesID}" class="${classes}">
      ${hearts}
    </div>
  `
}

function generateHearts(max: number, current: number): string {
	return Array.from({ length: max }, (_, index) => {
		const isFilled = index < current
		const heartClass = isFilled
			? 'w-5 h-5 bg-gray-950 rounded-xl'
			: 'w-5 h-5 bg-gray-950 rounded-xl opacity-35'

		return `<div class="${heartClass}"></div>`
	}).join('')
}

export function updateLives(
	livesID: string,
	current: number,
	max: number
): void {
	const livesEl = document.getElementById(livesID)
	if (livesEl) {
		livesEl.innerHTML = generateHearts(max, current)
	}
}
