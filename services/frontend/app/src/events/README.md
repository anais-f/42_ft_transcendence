# Events Layer

## Purpose

This directory contains **event handlers** for user interactions. These handlers manage the flow between user actions, API calls, and UI feedback using the event delegation pattern.

## Standard Pattern

All event handlers follow this consistent pattern:

```typescript
import { Notyf } from 'notyf'
const notyf = new Notyf()

export async function handleAction(form: HTMLFormElement) {
	// 1. Get data from DOM
	const formData = new FormData(form)
	const field = formData.get('field')

	// 2. Validate
	if (!field) {
		notyf.open({ type: 'info', message: 'Please fill all fields' })
		return
	}

	// 3. Call API
	const { data, error, status } = await someAPI(field)

	// 4. Handle errors (custom messages per status code)
	if (error) {
		switch (status) {
			case 401:
				notyf.error('Unauthorized')
				break
			case 409:
				notyf.error('Already exists')
				break
			case 0:
				notyf.error('Network error')
				break
			default:
				notyf.error(error)
		}
		return
	}

	// 5. Success
	notyf.success('Success!')
	await window.navigate('/')
}
```

## Rules

- ✅ Get data from DOM
- ✅ Validate input
- ✅ Call API/usecases
- ✅ Display notifications (Notyf)
- ✅ Navigate
- ❌ No direct fetch calls (use API layer)

## Event Delegation

See [EVENT-DELEGATION-PATTERN.md](../EVENT-DELEGATION-PATTERN.md)

```typescript
export function attachPageEvents() {
	const content = document.getElementById('content')
	if (!content) return

	submitHandler = async (e: Event) => {
		e.preventDefault()
		const form = (e.target as HTMLElement).closest('form[data-form]')
		if (!form) return

		const formName = form.getAttribute('data-form')
		if (formName === 'my-form') await handleMyForm(form)
	}

	content.addEventListener('submit', submitHandler)
}
```
