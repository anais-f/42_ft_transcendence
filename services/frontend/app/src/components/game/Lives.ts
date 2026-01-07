/**
 * Renders a lives component with heart icons.
 * @param props.max - The maximum number of lives.
 * @param props.current - The current number of lives.
 * @param props.livesID - The ID for the lives container element.
 * @param props.size - The size of the heart icons (3, 4, 5, or 6).
 * @param props.additionalClasses - Additional CSS classes for styling.
 */
interface LivesProps {
	max: number
	current: number
	livesID: string
	size: 3 | 4 | 5 | 6
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

		const sizeClasses: Record<number, string> = {
			3: 'w-3 h-3',
			4: 'w-4 h-4',
			5: 'w-5 h-5',
			6: 'w-6 h-6'
		}

		return `
		<svg class="${sizeClasses[size] || 'w-5 h-5'} inline-block" viewBox="0 0 16 16" fill="${fillColor}">
		<path d="M11.75,1C10.126,1,8.716,1.911,8,3.249C7.284,1.911,5.874,1,4.25,1C1.903,1,0,2.903,0,5.25C0,11,8,15,8,15s8-4,8-9.75 C16,2.903,14.097,1,11.75,1z" />
		</svg>
		`
	}).join('')
}

export function updateLives(
	livesID: string,
	current: number,
	max: number,
	size: 3 | 4 | 5 | 6
): void {
	const livesEl = document.getElementById(livesID)
	if (livesEl) {
		livesEl.innerHTML = generateHearts(max, current, size)
	}
}
