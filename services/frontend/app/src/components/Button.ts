/**
 * Button component props
 * text: button text
 * id: button id
 * type: button type - default is 'button', 'submit' is used for forms
 * action: optional data-action attribute
 * additionalClasses: optional additional classes for the button
 */
interface ButtonProps {
	text: string
	id: string
	type: 'button' | 'submit'
	action?: string
	additionalClasses?: string
}

/**
 * Button component
 * @param props
 * @constructor
 */
export const Button = (props: ButtonProps): string => {
	const { text, id, type, action, additionalClasses = '' } = props

	// base classes CSS for the button
	const baseClasses =
		'border-2 border-black hover:bg-black hover:text-white w-full py-2 mb-2 transition-colors text-lg'

	// conditionnal data attribute
	const dataActionAttr = action ? `data-action="${action}"` : ''

	// combinate all classes for the button
	const classes = `${baseClasses} ${additionalClasses}`.trim()

	return /*html*/ `
    <button id="${id}" type="${type}" class="${classes}" ${dataActionAttr}>
      ${text}
    </button>
  `
}
