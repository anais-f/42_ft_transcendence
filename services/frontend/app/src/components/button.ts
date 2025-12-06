interface ButtonProps {
	label?: string
	className?: string
	name?: string
	type?: 'button' | 'submit' | 'reset'
	disabled?: boolean
	onClick?: (ev: MouseEvent) => void
}

export function createButton(props: ButtonProps): HTMLButtonElement {
	const button = document.createElement('button')
	button.type = props.type ?? 'button'
	button.className = props.className ?? ''
	button.disabled = props.disabled ?? false
	button.textContent = props.label ?? props.name ?? ''
	if (props.onClick) button.addEventListener('click', props.onClick)
	return button
}
