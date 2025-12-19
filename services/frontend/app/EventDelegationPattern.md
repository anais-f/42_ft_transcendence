# Event Delegation Pattern

This guide explains the **event delegation pattern** used in this project for handling user interactions (forms, buttons, links, etc.).

---

## Table of Contents

1. [What is Event Delegation?](#what-is-event-delegation)
2. [Why Use Event Delegation?](#why-use-event-delegation)
3. [How It Works - Line by Line](#how-it-works---line-by-line)
4. [Template for New Pages](#template-for-new-pages)
5. [Common Patterns](#common-patterns)

---

## What is Event Delegation?

Event delegation is a technique where you attach **ONE event listener** to a parent element instead of attaching listeners to each child element individually.

### Traditional Approach

```typescript
// Attach a listener to EACH button
const btn1 = document.getElementById('btn-1')
const btn2 = document.getElementById('btn-2')
const btn3 = document.getElementById('btn-3')

btn1.addEventListener('click', handleBtn1)
btn2.addEventListener('click', handleBtn2)
btn3.addEventListener('click', handleBtn3)

// You must manually remove them when leaving the page
btn1.removeEventListener('click', handleBtn1)
btn2.removeEventListener('click', handleBtn2)
btn3.removeEventListener('click', handleBtn3)
```

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

// No need to remove listeners! ✨
```

---

## Why Use Event Delegation?

### Advantages

✅ **One listener** instead of many
✅ **No manual cleanup** needed (no `removeEventListener`)
✅ **Works with `innerHTML`** (listeners survive DOM replacement)
✅ **Dynamic elements** work automatically (added elements inherit the listener)
✅ **Less memory usage** (fewer event listeners in memory)
✅ **Simpler code** (centralized event handling)

### Comparison

| Feature                 | Traditional    | Delegation            |
| ----------------------- | -------------- | --------------------- |
| Listeners per page      | 10-20+         | 2-3                   |
| Manual cleanup          | ✅ Required    | ❌ Not needed         |
| Works after `innerHTML` | ❌ No          | ✅ Yes                |
| Dynamic elements        | ❌ Must rebind | ✅ Work automatically |
| Memory leaks risk       | ⚠️ High        | ✅ Low                |

---

## How It Works - Line by Line

### Complete Function Explained

```typescript
export function attachLoginEvents() {
	// 1. Get the container element (where the router injects page HTML)
	const content = document.getElementById('content')
	if (!content) return

	// 2. Handle FORM SUBMISSIONS
	content.addEventListener('submit', async (e) => {
		// 2.1. Find the form element that triggered the event
		//      e.target = the element that triggered the event (could be <button> or <input>)
		//      closest() = walks up the DOM tree to find the nearest <form> with data-form attribute
		const form = (e.target as HTMLElement).closest('form[data-form]')

		// 2.2. If no form found, stop here
		if (!form) return

		// 2.3. Prevent default browser behavior (page reload)
		//      By default, submitting a form reloads the page
		//      preventDefault() stops this, allowing us to handle it with JavaScript
		e.preventDefault()

		// 2.4. Get the form type from the data-form attribute
		//      Example: <form data-form="login"> → formName = "login"
		const formName = form.getAttribute('data-form')

		// 2.5. Route to the appropriate handler based on form type
		if (formName === 'register') {
			await handleRegister(form as HTMLFormElement)
		}

		if (formName === 'login') {
			await handleLogin(form as HTMLFormElement)
		}
	})

	// 3. Handle BUTTON CLICKS
	content.addEventListener('click', (e) => {
		// 3.1. Get the element that was clicked
		const target = e.target as HTMLElement

		// 3.2. Find the nearest button with data-action attribute
		//      Why closest()? Because the user might click on an <img> inside the <button>
		//      Example: <button data-action="logout"><img src="icon.svg">Logout</button>
		//      If user clicks the <img>, e.target = <img>, but closest() finds the <button>
		const actionButton = target.closest('[data-action]')

		// 3.3. If found, get the action name and execute the handler
		if (actionButton) {
			const action = actionButton.getAttribute('data-action')

			if (action === 'login-google') {
				handleGoogleLogin()
			}

			if (action === 'logout') {
				handleLogout()
			}
		}
	})

	console.log('Login page events attached')
}
```

### Key Concepts Explained

#### `e.target` vs `closest()`

```html
<button data-action="delete">
	<img src="trash.svg" alt="delete" /> ← User clicks HERE Delete
</button>
```

- `e.target` = `<img>` (the element that was clicked)
- `e.target.closest('[data-action]')` = `<button>` (the parent with `data-action`)

#### `e.preventDefault()`

```typescript
e.preventDefault() // Stop the default browser behavior
```

For forms: **prevents page reload**
For links: **prevents navigation**
For drag & drop: **prevents default drop behavior**

#### CSS Selectors in `closest()`

```typescript
'form[data-form]' // <form> with any data-form attribute
'form[data-form="login"]' // <form> with data-form="login" exactly
'[data-action]' // Any element with data-action attribute
'button[data-action]' // <button> with data-action attribute
```

---

## Template for New Pages

### 1. HTML Structure

```html
<!-- Use data-form for forms -->
<form data-form="my-form-name">
	<input type="text" name="username" required />
	<button type="submit">Submit</button>
</form>

<!-- Use data-action for buttons -->
<button data-action="my-action">Click Me</button>

<!-- Use data-navigate for SPA navigation links -->
<a data-navigate="/home">Home</a>
```

### 2. TypeScript Page File

```typescript
// pages/mypage.ts

import { handleMyForm, handleMyAction } from '../events/myPageHandlers'

// Page HTML
export const MyPage = (): string => {
	return /*html*/ `
    <div>
      <form data-form="my-form">
        <input type="text" name="username">
        <button type="submit">Submit</button>
      </form>

      <button data-action="my-action">Click Me</button>

      <a data-navigate="/home">Go Home</a>
    </div>
  `
}

// Event delegation function
export function attachMyPageEvents() {
	const content = document.getElementById('content')
	if (!content) return

	// Handle forms
	content.addEventListener('submit', async (e) => {
		const form = (e.target as HTMLElement).closest('form[data-form]')
		if (!form) return

		e.preventDefault()
		const formName = form.getAttribute('data-form')

		if (formName === 'my-form') {
			await handleMyForm(form as HTMLFormElement)
		}
	})

	// Handle button clicks
	content.addEventListener('click', (e) => {
		const target = e.target as HTMLElement

		// Handle action buttons
		const actionButton = target.closest('[data-action]')
		if (actionButton) {
			const action = actionButton.getAttribute('data-action')

			if (action === 'my-action') {
				handleMyAction()
			}
		}

		// Handle navigation links
		const navLink = target.closest('[data-navigate]')
		if (navLink) {
			e.preventDefault()
			const path = navLink.getAttribute('data-navigate')
			if (path) window.navigate(path)
		}
	})

	console.log('My page events attached')
}
```

### 3. Router Configuration

```typescript
// router/routerMap.ts

import { MyPage, attachMyPageEvents } from '../pages/mypage'

export const routerMap: Record<Pages, Route> = {
	mypage: {
		id: 'mypage',
		url: '/mypage',
		page: MyPage,
		binds: [attachMyPageEvents], // ← Attach events
		// No unbinds needed! ✨
		public: false
	}
}
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

### Pattern 3: SPA Navigation

```typescript
content.addEventListener('click', (e) => {
	const target = e.target as HTMLElement
	const navLink = target.closest('[data-navigate]')

	if (navLink) {
		e.preventDefault()
		const path = navLink.getAttribute('data-navigate')
		if (path) window.navigate(path)
	}
})
```

### Pattern 4: Dynamic Elements (e.g., List Items)

```html
<ul>
	<li>
		Item 1
		<button data-action="delete" data-id="1">Delete</button>
	</li>
	<li>
		Item 2
		<button data-action="delete" data-id="2">Delete</button>
	</li>
</ul>
```

```typescript
content.addEventListener('click', (e) => {
	const target = e.target as HTMLElement
	const actionButton = target.closest('[data-action]')

	if (actionButton) {
		const action = actionButton.getAttribute('data-action')
		const id = actionButton.getAttribute('data-id')

		if (action === 'delete' && id) {
			handleDelete(id)
		}
	}
})
```

---

## Summary

### The Pattern

1. **HTML**: Use `data-form` for forms, `data-action` for buttons
2. **JavaScript**: Attach listeners to `#content`
3. **Router**: Call `attachEvents()` in the `binds` array
4. **No cleanup needed**: Event delegation handles it automatically

### Benefits

- Simple and maintainable
- No memory leaks
- Works with dynamic content
- Easy to debug (centralized event handling)

### Copy-Paste Template

```typescript
export function attachMyPageEvents() {
	const content = document.getElementById('content')
	if (!content) return

	content.addEventListener('submit', async (e) => {
		const form = (e.target as HTMLElement).closest('form[data-form]')
		if (!form) return
		e.preventDefault()
		const formName = form.getAttribute('data-form')
		// Handle forms here
	})

	content.addEventListener('click', (e) => {
		const target = e.target as HTMLElement
		const actionButton = target.closest('[data-action]')
		if (actionButton) {
			const action = actionButton.getAttribute('data-action')
			// Handle actions here
		}
	})
}
```

---

## Project Architecture

This project follows a clean separation of concerns:

```
src/
├── pages/
│   └── oldlogin.ts
│       📄 Role: View (HTML) + DOM manipulation
│       - LoginPage(): returns HTML
│       - switchTo2FAForm(): show/hide forms
│       - attachLoginEvents(): attach event listeners
│       - detachLoginEvents(): cleanup (if needed)
│
├── events/
│   └── loginPageHandlers.ts
│       🎯 Role: Event handlers + orchestration
│       - handleLogin(form)
│           1. Get data from form
│           2. Validate input
│           3. Call API
│           4. Handle errors with switch/case
│           5. Display success/navigate
│       - handleRegister(form)
│       - handle2FASubmit(form)
│       See: events/README.md
│
├── usecases/
│   ├── userStore.ts
│   │   📦 Role: State management
│   │   - currentUser
│   │   - setCurrentUser(user)
│   │
│   └── userSession.ts
│       🔐 Role: Session operations
│       - checkAuth(): Promise<user | null>
│       - logout(): cleanup + redirect
│       - cleanupUserSession()
│       See: usecases/README.md
│
├── api/
│   ├── authApi.ts
│   │   🌐 Role: Pure HTTP calls
│   │   - loginAPI(username, password): { data, error, status }
│   │   - registerAPI(username, password): { data, error, status }
│   │   - logoutAPI(): { data, error, status }
│   │
│   └── twoFAApi.ts
│       - verify2FALoginAPI(code): { data, error, status }
│       See: api/README.md
│
└── utils/
    └── userValidation.ts
        ✅ Role: Reusable validation functions
        - validateUsername(username): boolean
        - validatePassword(password): boolean
```

### Data Flow

```
User Action → Event Handler → API/Usecase → Update UI
   (DOM)         (events/)      (api/)      (Notyf/navigate)
```

Example:

```
1. User clicks "Login" button
2. attachLoginEvents() catches submit event (event delegation)
3. handleLogin() validates form, calls loginAPI()
4. loginAPI() returns { data, error, status }
5. handleLogin() displays error/success with Notyf
6. On success: checkAuth(), setCurrentUser(), navigate()
```
