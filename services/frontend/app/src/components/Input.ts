/**
 * Input component props interface
 * id: input id for label and input -> for CSS/TS target, must be unique
 * name: input name for the form -> for submit, key/value pair
 * placeholder: input placeholder
 * type: input type (text, password, email, etc.)
 * required: input required
 * additionalClasses: optional additional CSS classes
 * maxLength: optional maximum length of the input
 * pattern: optional validation pattern for the input
 * autoComplete: optional autocomplete attribute
 * inputmode: optional inputmode attribute
 */
interface InputProps {
	id: string
	name: string
	placeholder: string
	type: 'text' | 'password'
	required: boolean
	additionalClasses?: string
	maxLength?: number
	pattern?: string
	autoComplete?: string
	inputmode?: string
}

/**
 * Input component
 * @param props
 * @constructor
 */
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

	// base classes CSS for the input
	const baseClasses =
		'px-2 border-b-2 text-lg border-black bg-inherit w-full font-special'

	// combinate all classes for the input
	const classes = `${baseClasses} ${additionalClasses}`.trim()

	// conditionnal attributes
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
