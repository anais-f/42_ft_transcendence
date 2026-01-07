/**
 * Generates an HTML button element with customizable properties.
 * @param props.text - The text to display on the button.
 * @param props.id - The id attribute for the button element.
 * @param props.type - The type attribute for the button element ('button' or 'submit').
 * @param props.action - Optional data-action attribute for the button.
 * @param props.additionalClasses - Optional additional CSS classes to apply to the button.
 * @param props.dataAttributes - Optional additional data attributes as a string.
 */
interface ButtonProps {
	text: string
	id: string
	type: 'button' | 'submit'
	action?: string
	additionalClasses?: string
	dataAttributes?: string
}

export const Button = (props: ButtonProps): string => {
	const {
		text,
		id,
		type,
		action,
		additionalClasses = '',
		dataAttributes = ''
	} = props

	const baseClasses =
		'border-2 border-black hover:bg-black hover:text-white w-full py-2 mb-2 transition-colors text-lg'

	const dataActionAttr = action ? `data-action="${action}"` : ''

	const classes = `${baseClasses} ${additionalClasses}`.trim()

	return /*html*/ `
    <button id="${id}" type="${type}" class="${classes}" ${dataActionAttr} ${dataAttributes}>
      ${text}
    </button>
  `
}
