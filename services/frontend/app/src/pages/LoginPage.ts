import { handleLogin, handleRegister } from '../events/loginPageHandlers.js'
import {
	checkAuth,
	loadGoogleScript,
	loginWithGoogleCredential
} from '../api/authService.js'
import { CredentialResponse } from '../types/google-type.js'
import { setCurrentUser } from '../usecases/userStore.js'

// TODO : components for buttons and inputs
// TODO : component lorem ipsum
// TODO : refactor HTML and CSS

export const TestPage = (): string => {
	return /*html*/ `
  <section class="grid grid-cols-4 gap-10 h-full w-full">

  <div class="bg-gray-100">
   <p> 1ere colonne </p>

  </div>

   <div class="bg-blue-100">
    <p> 2ere colonne </p>
   </div>

   <div class="bg-yellow-100">
    <p> 3ere colonne </p>
   </div>

   <div class="bg-yellow-100 col-span-1">
    <p> 4ere colonne </p>
   </div>

  </section>
`
}

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

	initGoogleAuth().catch((err) => {
		console.error('Failed to initialize Google Auth:', err)
	})

	console.log('Login page events attached')
}

export async function initGoogleAuth() {
	const btnContainer = document.getElementById('google-btn-container')
	if (!btnContainer) return

	// Clear container before rendering to avoid duplicates
	btnContainer.innerHTML = ''

	try {
		await loadGoogleScript()
		if (window.google) {
			window.google.accounts.id.initialize({
				client_id: 'PUSH HERE GOOGLE ID',
				callback: async (response: CredentialResponse) => {
					console.log('Google Credential received', response)

					try {
						await loginWithGoogleCredential(response.credential)

						const authResult = await checkAuth()
						setCurrentUser(authResult)
						await window.navigate('/', true)
					} catch (err) {
						console.error('Google Login Error:', err)
						alert('Erreur de connexion Google')
					}
				}
			})

			window.google.accounts.id.renderButton(btnContainer, {
				theme: 'outline',
				size: 'large',
				text: 'continue_with',
				width: '300'
			})
			console.log('Google button rendered')
		}
	} catch (e) {
		console.error('Impossible de charger le script Google API', e)
	}
}

export function cleanupGoogleAuth() {
	const btnContainer = document.getElementById('google-btn-container')
	if (btnContainer) {
		btnContainer.innerHTML = ''
	}

	// Cancel Google One Tap prompt if active
	if (window.google?.accounts?.id) {
		window.google.accounts.id.cancel()
	}

	console.log('Google Auth cleaned up')
}
