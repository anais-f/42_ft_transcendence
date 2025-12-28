/**
 * Toggle option interface
 * value: option value
 * label: option display label
 */
interface ToggleOption {
	value: string
	label: string
}

/**
 * ToggleGroup component props interface
 * name: input name for form submission
 * label: group label displayed above buttons
 * options: array of toggle options
 * defaultValue: initially selected value
 */
interface ToggleGroupProps {
	name: string
	label: string
	options: ToggleOption[]
	defaultValue: string
}

export const ToggleGroup = (props: ToggleGroupProps): string => {
	const { name, label, options, defaultValue } = props

	const baseClasses =
		'flex-1 py-2 mb-2 border-2 border-black text-center cursor-pointer'

	const buttons = options
		.map((option) => {
			const isActive = option.value === defaultValue
			const stateClasses = isActive
				? 'bg-black text-white'
				: 'hover:bg-gray-200'

			return /*html*/ `
			<button
				type="button"
				class="${baseClasses} ${stateClasses}"
				data-action="toggle-option"
				data-toggle-name="${name}"
				data-toggle-value="${option.value}"
			>
				${option.label}
			</button>
			`
		})
		.join('')

	return /*html*/ `
	<div class="mb-4">
		<label class="block text-lg font-semibold mb-2">${label}</label>
		<div class="flex gap-2">
			${buttons}
		</div>
		<input type="hidden" name="${name}" id="toggle-${name}" value="${defaultValue}" />
	</div>
	`
}

export function handleToggleClick(button: HTMLElement): void {
	const name = button.getAttribute('data-toggle-name')
	const value = button.getAttribute('data-toggle-value')
	if (!name || !value) return

	// update visual state
	const container = button.parentElement
	if (container) {
		container.querySelectorAll('button').forEach((btn) => {
			btn.classList.remove('bg-black', 'text-white')
			btn.classList.add('hover:bg-gray-200')
		})
		button.classList.add('bg-black', 'text-white')
		button.classList.remove('hover:bg-gray-200')
	}

	// update hidden input
	const input = document.getElementById(`toggle-${name}`) as HTMLInputElement
	if (input) {
		input.value = value
	}
}

export function getToggleValue(name: string): string {
	const input = document.getElementById(`toggle-${name}`) as HTMLInputElement
	return input?.value || ''
}
