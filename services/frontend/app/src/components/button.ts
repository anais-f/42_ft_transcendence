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

// class Button implements ButtonProps {
// 	label?: string
// 	className?: string
// 	name?: string
// 	type?: 'button' | 'submit' | 'reset'
// 	disabled?: boolean
// 	onClick?: (ev: MouseEvent) => void

// 	constructor(props: ButtonProps = {}) {
// 		this.label = props.label
// 		this.className = props.className
// 		this.name = props.name
// 		this.type = props.type ?? 'button'
// 		this.disabled = props.disabled ?? false
// 		this.onClick = props.onClick
// 	}

// 	setClassName(className: string): void {
// 		this.className = className
// 	}

// }
