# Event Delegation Pattern

This guide explains the **event delegation pattern** used in this project for handling user interactions (forms, buttons, links, etc.).

---

## What is Event Delegation?

Event delegation is a technique where you attach **ONE event listener** to a parent element instead of attaching listeners to each child element individually.

### Event Delegation

```typescript
// Attach ONE listener to the parent
const content = document.getElementById('content')

content.addEventListener('click', (e) => {
	const target = e.target as HTMLElement
	const button = target.closest('[data-action]')

	if (button) {
		const action = button.getAttribute('data-action')

		if (action === 'btn-1') handleBtn1()
		if (action === 'btn-2') handleBtn2()
		if (action === 'btn-3') handleBtn3()
	}
})

// No need to remove listeners!
```

---

## Common Patterns

### Pattern 1: Multiple Forms

```typescript
content.addEventListener('submit', async (e) => {
	const form = (e.target as HTMLElement).closest('form[data-form]')
	if (!form) return

	e.preventDefault()
	const formName = form.getAttribute('data-form')

	if (formName === 'login') await handleLogin(form)
	if (formName === 'register') await handleRegister(form)
	if (formName === 'forgot-password') await handleForgotPassword(form)
	if (formName === 'profile-edit') await handleProfileEdit(form)
})
```

### Pattern 2: Multiple Button Actions

```typescript
content.addEventListener('click', (e) => {
	const target = e.target as HTMLElement
	const actionButton = target.closest('[data-action]')

	if (actionButton) {
		const action = actionButton.getAttribute('data-action')

		if (action === 'delete') handleDelete()
		if (action === 'edit') handleEdit()
		if (action === 'logout') handleLogout()
		if (action === 'open-modal') handleOpenModal()
	}
})
```

---

### Data Flow

```
User Action → Event Handler → API/Usecase → Update UI
   (DOM)         (events/)      (api/)      (Notyf/navigate)
```
