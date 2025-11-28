interface FormProps {
	id: string
	className: string
	action?: string
	method?: string
	label?: string[]
	input?: { id: string; type: string; name: string; required?: boolean;  separator?: boolean; }[]
	button?: { text: string; type: 'submit' | 'button'; className?: string; onClick?: (ev: MouseEvent) => void }
	onSubmit?: (data: FormData) => void
}

export function createForm(props: FormProps): HTMLFormElement {
	const form = document.createElement('form')
	form.id = props.id
	form.className = props.className
	if (props.action) form.action = props.action
	if (props.method) form.method = props.method
	 if (props.label || props.input) {
		const labels = props.label ?? []
		const inputs = props.input ?? []

		if (inputs.length > 0) {
			inputs.forEach((input, idx) => {
				const field = document.createElement('div')
				field.className = 'gap-4 flex border border-gray-400'
				const labelText = labels[idx]
				if (labelText) {
					const labelElement = document.createElement('label')
					labelElement.htmlFor = input.id
					labelElement.textContent = labelText
					field.appendChild(labelElement)
				}
				const inputElement = document.createElement('input')
				inputElement.id = input.id
				inputElement.type = input.type
				inputElement.name = input.name
				if (input.required) inputElement.required = true
				field.appendChild(inputElement)

				form.appendChild(field)
			})
		} else {
			labels.forEach(label => {
				const field = document.createElement('div')
				field.className = 'gap-4 border border-gray-400'
				const labelElement = document.createElement('label')
				labelElement.textContent = label
				field.appendChild(labelElement)
				form.appendChild(field)
			})
		}
	}

	if (props.button) {
		const button = document.createElement('button')
		button.textContent = props.button.text
		button.type = props.button.type
		if (props.button.className) 
			button.className = props.button.className
		if (props.button.type === 'button' && props.button.onClick)
			button.addEventListener('click', props.button.onClick)

		form.appendChild(button)
	}

	if (props.onSubmit) {
		const submitHandler = props.onSubmit
		form.addEventListener('submit', (ev) => {
			ev.preventDefault()
			const formData = new FormData(form)
			submitHandler(formData)
		})
	}

	return form
}