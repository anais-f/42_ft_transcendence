/**
 * Props interface for the StatusCircle component
 */
interface StatusCircleProps {
	isOnline: boolean
}

/**
 * Renders a status indicator with an optional animation
 * when the user is online.
 * @param props
 * @constructor
 */
export const StatusCircle = ({ isOnline }: StatusCircleProps): string => {
	return isOnline
		? `<span class="relative flex w-3 h-3">
         <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
         <span class="relative inline-flex w-3 h-3 rounded-full bg-green-500"></span>
       </span>`
		: `<span class="w-3 h-3 rounded-full bg-gray-500"></span>`
}
