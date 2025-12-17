import { Button } from '../components/Button.js'
import { Input } from '../components/Input.js'
import { LoremSection } from '../components/LoremIpsum.js'
import {
	handle2FASubmit,
	handleLogin,
	handleRegister
} from '../events/loginPageHandlers.js'
import { loadGoogleScript, loginWithGoogleCredential } from '../api/authApi.js'
import { CredentialResponse } from '../types/google-type.js'
import { checkAuth } from '../usecases/userSession.js'
import { setCurrentUser } from '../usecases/userStore.js'
import { notyfGlobal as notyf } from '../utils/notyf.js'

export const LoginPage = (): string => {
	return /*html*/ `
  <section class="grid grid-cols-4 gap-10 h-full w-full">

    <div class="flex flex-col items-start min-h-0">
      <h1 class="title_bloc">SUBSCRIBE TO OUR NEWSPAPER</h1>
      <form id="register_form" data-form="register" class="flex flex-col gap-2">
          ${Input({
						id: 'register_login',
						name: 'register_login',
						placeholder: 'Login',
						type: 'text',
						required: true
					})}
          ${Input({
						id: 'register_password',
						name: 'register_password',
						placeholder: 'Password',
						type: 'password',
						required: true
					})}
          ${Input({
						id: 'register_conf_password',
						name: 'register_conf_password',
						placeholder: 'Confirm password',
						type: 'password',
						required: true
					})}
          ${Button({
						text: 'Subscribe',
						id: 'register_btn',
						type: 'submit'
					})}
      </form>

      ${LoremSection({
				title: 'Newsletter',
				variant: 'xl',
				fillSpace: true
			})}
    </div>

     <div class="flex flex-col items-start min-h-0">
      ${LoremSection({
				variant: 'long'
			})}
      <img src="/assets/images/mammoth.png" alt="mamouth" class="img_style">
      ${LoremSection({
				title: 'Mamamoth',
				variant: 'medium',
				fillSpace: true
			})}
     </div>

     <div class="flex flex-col items-start min-h-0">
      ${LoremSection({
				variant: 'short'
			})}
      <h1 class="title_bloc mt-4">RESUME READING</h1>
      <!-- Login Form -->
      <form id="login_form" data-form="login" class="form_style">
          ${Input({
						id: 'login_login',
						name: 'login_login',
						placeholder: 'Login',
						type: 'text',
						required: true
					})}
          ${Input({
						id: 'login_password',
						name: 'login_password',
						placeholder: 'Password',
						type: 'password',
						required: true
					})}
          ${Button({
						text: 'Login',
						id: 'login_btn',
						type: 'submit'
					})}
      </form>

      <!-- 2FA Form -->
      <form id="2fa_form" data-form="2fa" class="form_style hidden">
          ${Input({
						id: '2fa_code',
						name: '2fa_code',
						placeholder: '000000',
						type: 'text',
						required: true,
						maxLength: 6,
						pattern: '[0-9]{6}',
						autoComplete: 'one-time-code',
						inputmode: 'numeric',
						additionalClasses:
							'tracking-widest text-center letter-spacing-widest'
					})}
          ${Button({
						id: '2fa_btn',
						text: 'Validate',
						type: 'submit'
					})}
      </form>

      ${LoremSection({
				title: 'Introduction',
				variant: 'xl',
				fillSpace: true
			})}
     </div>

     <div class="flex flex-col items-start min-h-0">
      ${LoremSection({
				title: 'New Partener',
				variant: 'medium',
				additionalClasses: 'mb-4'
			})}
      <div id="google-btn-container" class="my-4 w-full flex justify-center"></div>
      <img src="/assets/images/screamer_girl.png" alt="screamer girl" class="img_style">
      ${LoremSection({
				variant: 'medium',
				fillSpace: true
			})}
     </div>

  </section>
`
}

let submitHandler: ((e: Event) => Promise<void>) | null = null
let clickHandler: ((e: Event) => void) | null = null

export function attachLoginEvents() {
	const content = document.getElementById('content')
	if (!content) return

	submitHandler = async (e: Event) => {
		e.preventDefault()

		const form = (e.target as HTMLElement).closest('form[data-form]')
		if (!form) return

		const formName = form.getAttribute('data-form')
		if (formName === 'register') await handleRegister(form as HTMLFormElement)
		if (formName === 'login') await handleLogin(form as HTMLFormElement)
		if (formName === '2fa') await handle2FASubmit(form as HTMLFormElement)
	}

	clickHandler = (e: Event) => {
		const target = e.target as HTMLElement
		const actionButton = target.closest('[data-action]')
		if (actionButton) {
			const action = actionButton.getAttribute('data-action')
			// Handle actions if needed
		}
	}

	content.addEventListener('submit', submitHandler)
	content.addEventListener('click', clickHandler)

	initGoogleAuth().catch((err) => {
		console.error('Failed to initialize Google Auth:', err)
	})

	console.log('Login page events attached')
}

export function detachLoginEvents() {
	const content = document.getElementById('content')
	if (!content) return

	if (submitHandler) {
		content.removeEventListener('submit', submitHandler)
		submitHandler = null
	}

	if (clickHandler) {
		content.removeEventListener('click', clickHandler)
		clickHandler = null
	}

	cleanupGoogleAuth()

	console.log('Login page events detached')
}

export async function initGoogleAuth() {
	const btnContainer = document.getElementById('google-btn-container')
	if (!btnContainer) return

	btnContainer.replaceChildren()

	try {
		await loadGoogleScript()
		if (window.google) {
			window.google.accounts.id.initialize({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				callback: async (response: CredentialResponse) => {
					try {
						await loginWithGoogleCredential(response.credential)
						const authResult = await checkAuth()
						setCurrentUser(authResult)
						await window.navigate('/', true)
					} catch (err) {
						console.error('Google Login Error:', err)
						notyf.error('Connection error with Google')
					}
				}
			})

			window.google.accounts.id.renderButton(btnContainer, {
				theme: 'outline',
				size: 'large',
				text: 'continue_with',
				width: '300'
			})
		}
	} catch (e) {
		console.error('Impossible to load Google API script', e)
	}
}

export function cleanupGoogleAuth() {
	const btnContainer = document.getElementById('google-btn-container')
	if (btnContainer) {
		btnContainer.replaceChildren()
	}

	if (window.google?.accounts?.id) window.google.accounts.id.cancel()

	console.log('Google Auth cleaned up')
}

export function switchTo2FAForm() {
	const loginForm = document.getElementById('login_form')
	loginForm?.classList.add('hidden')

	const twoFAForm = document.getElementById('2fa_form')
	twoFAForm?.classList.remove('hidden')
	twoFAForm?.classList.add('flex')

	const codeInput = document.getElementById('2fa_code') as HTMLInputElement
	codeInput?.focus()
}
