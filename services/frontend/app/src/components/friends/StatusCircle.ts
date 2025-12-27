/**
 * Props interface for the StatusCircle component
 */
interface StatusCircleProps {
	isOnline: boolean
	id?: string
	additionalClasses?: string
}

/**
 * Renders a status indicator with an optional animation
 * when the user is online.
 * @param props
 * @constructor
 */
export const StatusCircle = (props: StatusCircleProps): string => {
	const { isOnline, id, additionalClasses } = props

	const idAttr = id ? ` id="${id}"` : ''
	return isOnline
		? `<span${idAttr} class="${additionalClasses ?? ''} relative flex w-3 h-3">
         <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
         <span class="relative inline-flex w-3 h-3 rounded-full bg-green-500"></span>
       </span>`
		: `<span${idAttr} class="${additionalClasses ?? ''} w-3 h-3 rounded-full bg-gray-500"></span>`
}

const BASE_CLASSES = [
	'relative',
	'flex',
	'w-3',
	'h-3',
	'rounded-full',
	'bg-gray-500',
	'bg-green-500'
]

export function updateStatusCircle(id: string, isOnline: boolean): void {
	const element = document.getElementById(id)
	if (element) {
		const currentClasses = Array.from(element.classList)
		const additionalClasses = currentClasses
			.filter((cls) => !BASE_CLASSES.includes(cls))
			.join(' ')
		element.outerHTML = StatusCircle({ isOnline, id, additionalClasses })
	}
}
