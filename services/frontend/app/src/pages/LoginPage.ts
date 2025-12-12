import {
	handleLogin,
	handleRegister,
	handleGoogleLogin
} from '../events/loginPageHandlers.js'

// TODO : refactor HTML and CSS

/**
 * Attach event listeners for the login page
 */
export function attachLoginEvents() {
	const content = document.getElementById('content')
	if (!content) return

	// Manage SUBMITS (forms)
	content.addEventListener('submit', async (e) => {
		const form = (e.target as HTMLElement).closest('form[data-form]')
		if (!form) return

		e.preventDefault()
		const formName = form.getAttribute('data-form')

		if (formName === 'register') await handleRegister(form as HTMLFormElement)
		if (formName === 'login') await handleLogin(form as HTMLFormElement)
	})

	// Manage CLICKS (buttons)
	content.addEventListener('click', (e) => {
		const target = e.target as HTMLElement

		const actionButton = target.closest('[data-action]')
		if (actionButton) {
			const action = actionButton.getAttribute('data-action')

			if (action === 'login-google') handleGoogleLogin()
		}
	})

	console.log('Login page events attached')
}
