import { size } from 'zod'

interface LivesProps {
	max: number
	current: number
	livesID: string
	size: number
	additionalClasses?: string
}

export const LivesComp = (props: LivesProps): string => {
	const { max, current, livesID, size, additionalClasses = '' } = props

	const baseClasses = 'flex flex-wrap gap-1 items-center w-fit'
	const classes = `${baseClasses} ${additionalClasses}`.trim()

	const hearts = generateHearts(max, current, size)

	return /*html*/ `
    <div id="${livesID}" class="${classes}">
      ${hearts}
    </div>
  `
}

function generateHearts(max: number, current: number, size: number): string {
	return Array.from({ length: max }, (_, index) => {
		const isFilled = index < current
		const fillColor = isFilled ? '#000000ff' : '#00000066'

		return `
		<svg class="w-${size}, h-${size}" viewBox="0 0 16 16" fill="${fillColor}">
			<path d="M11.75,1C10.126,1,8.716,1.911,8,3.249C7.284,1.911,5.874,1,4.25,1C1.903,1,0,2.903,0,5.25C0,11,8,15,8,15s8-4,8-9.75 C16,2.903,14.097,1,11.75,1z" />
		</svg>
        `
	}).join('')
}

export function updateLives(
	livesID: string,
	current: number,
	max: number,
	size: number
): void {
	const livesEl = document.getElementById(livesID)
	if (livesEl) {
		livesEl.innerHTML = generateHearts(max, current, size)
	}
}
