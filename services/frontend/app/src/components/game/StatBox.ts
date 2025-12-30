/**
 * StatBox Component
 * Renders a statistic box with a label and value.
 * @param props - The properties of the StatBox.
 * @param props.label - The label of the statistic.
 * @param props.value - The value of the statistic.
 * @param props.color - The color class for the value text.
 * @returns The HTML string representing the StatBox.
 */
interface StatProps {
	label: string
	value: number | string
	color: string
}

/**
 * StatBox component
 * @param props
 * @constructor
 */
export const StatBox = (props: StatProps): string => {
	const { label, value, color } = props

	return /*html*/ `
  <div class="flex flex-col py-3 rounded-md border border-black mb-2">
    <p class="flex justify-between px-4">
        <span class="text-md font-bold uppercase tracking-widest">${label}</span>
        <span class="text-xl font-black ${color}">${value}</span>
    </p>
    
  </div>
  `
}
