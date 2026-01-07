/**
 * A reusable input component that generates an HTML input element with customizable properties and styling.
 * @param props.id - The id attribute for the input element.
 * @param props.name - The name attribute for the input element.
 * @param props.placeholder - The placeholder text for the input element.
 * @param props.type - The type of the input element (e.g., 'text', 'password', 'file').
 * @param props.required - A boolean indicating whether the input is required.
 * @param props.additionalClasses - Optional additional CSS classes to apply to the input element.
 * @param props.maxLength - Optional maximum length for the input value.
 * @param props.pattern - Optional regex pattern that the input value must match.
 * @param props.autoComplete - Optional autocomplete attribute for the input element.
 * @param props.inputmode - Optional input mode attribute for the input element.
 */
interface InputProps {
	id: string
	name: string
	placeholder: string
	type: 'text' | 'password' | 'file'
	required: boolean
	additionalClasses?: string
	maxLength?: number
	pattern?: string
	autoComplete?: string
	inputmode?: string
}

export const Input = (props: InputProps): string => {
	const {
		id,
		name,
		placeholder,
		type,
		required,
		additionalClasses = '',
		maxLength,
		pattern,
		autoComplete,
		inputmode
	} = props

	const baseClasses =
		'px-2 border-b-2 text-lg border-black bg-inherit w-full font-special'

	const classes = `${baseClasses} ${additionalClasses}`.trim()

	const maxLengthAttr = maxLength ? `maxlength="${maxLength}"` : ''
	const patternAttr = pattern ? `pattern="${pattern}"` : ''
	const autoCompleteAttr = autoComplete ? `autocomplete="${autoComplete}"` : ''
	const inputmodeAttr = inputmode ? `inputmode="${inputmode}"` : ''

	return /*html*/ `
  <input
    id="${id}"
    name="${name}"
    type="${type}"
    placeholder="${placeholder}"
    class="${classes}"
    ${required ? 'required' : ''}
    ${maxLengthAttr}
    ${patternAttr}
    ${autoCompleteAttr}
    ${inputmodeAttr}
  >
  `
}
