import {
	handleLogin,
	handleRegister,
	handle2FASubmit
} from '../events/loginPageHandlers.js'
import { checkAuth } from '../usecases/userSession.js'
import { setCurrentUser } from '../usecases/userStore.js'
import { CredentialResponse } from '../types/google-type.js'
import { loadGoogleScript, loginWithGoogleCredential } from '../api/authApi.js'
import { notyfGlobal as notyf } from '../utils/notyf.js'

export const LoginPage = (): string => {
	return /*html*/ `
<section class="grid grid-cols-4 gap-11">
    <div class="col-span-1 flex flex-col items-start">
        <h1 class="text-2xl py-4">SUBSCRIBE TO OUR NEWSPAPER</h1>
        <form id="register_form" data-form="register" class="flex flex-col gap-2">
            <input id="register_username" type="text" name="register_username" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="USERNAME" required>
            <input id="register_password" type="password" name="register_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
            <input id="register_conf_password" type="password" name="register_conf_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="CONFIRM PASSWORD" required>
            <button id="register_btn" class="generic_btn mt-4" type="submit">Register</button>
        </form>
        <div class="news_paragraph">
            <h1 class="text-lg pt-4">Title</h1>
            <p class="text-sm py-2">Ipsi et pltre veam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt.</p>
        </div>
    </div>
    <div class="col-span-1 flex flex-col items-start">
        <div class="news_paragraph">
            <p class="text-sm pt-6 pb-2">Ipsum doiquams volup qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat.</p>
        </div>
        <img src="/assets/images/mammoth.png" alt="mamouth" class="w-full object-cover opacity-50 select-none">

        <div class="news_paragraph">
            <h1 class="text-lg pt-4">Title</h1>
            <p class="text-sm py-2">Ipsum . Eaque optirem. Qutates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt.</p>
        </div>
    </div>
    <div class="col-span-1 flex flex-col items-start">
        <div class="news_paragraph">
            <p class="text-sm py-6">Ipsum Conss oledio in ipsa corrupti aliquam qui commodi.ficia. Assumenda reprehendet placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat.</p>
        </div>
        <h1 class="text-2xl pt-4 pb-1">RESUME READING</h1>

        <!-- Formulaire de login (visible par défaut) -->
        <form id="login_form" data-form="login" class="flex flex-col gap-2">
            <input id="login_username" type="text" name="login_username" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="USERNAME" required>
            <input id="login_password" type="password" name="login_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
            <button id="login_btn" class="generic_btn mt-4" type="submit">Login</button>
        </form>

        <!-- Formulaire 2FA (caché par défaut) -->
        <form id="2fa_form" data-form="2fa" class="hidden flex-col gap-2">
            <p class="text-sm mb-2">Enter the 6-digit code from your authenticator app:</p>
            <input
                id="2fa_code"
                type="text"
                name="2fa_code"
                class="px-2 border-b-2 text-xl border-black bg-inherit w-full text-center tracking-widest font-mono"
                placeholder="000000"
                maxlength="6"
                pattern="[0-9]{6}"
                autocomplete="one-time-code"
                required
            >
            <button id="2fa_verify_btn" class="generic_btn mt-4" type="submit">Verify</button>
        </form>

        <div class="news_paragraph">
            <h1 class="text-lg pt-4">Title</h1>
            <p class="text-sm pb-2">Ipsum qa reprehenderit nesciunt. </p>
        </div>

    </div>
    <div class="col-span-1 flex flex-col items-start">
        <div class="news_paragraph">
            <h1 class="text-lg pt-6 pb-4">Title</h1>
            <p class="text-sm py-2">Ipsufficia. Nam peui volunis voluta ut est. Voluptatem dolore vero in. A aut iste et unde autem ut deserunt quam. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Beatae qui et placeat.</p>
        </div>
             <div id="google-btn-container" class="my-8 h-12 w-full flex justify-center"></div>
            <img src="/assets/images/screamer_girl.png" alt="screamer girl" class="w-full object-cover opacity-50 select-none">
    </div>
</section>
`
}

let submitHandler: ((e: Event) => Promise<void>) | null = null
let clickHandler: ((e: Event) => void) | null = null

/**
 * Attach event listeners for the login page.
 * Sets up handlers for form submissions and button clicks.
 * Also initializes Google Auth button.
 * Logs attachment status to the console.
 * @returns {void}
 */
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
		}
	}

	content.addEventListener('submit', submitHandler)
	content.addEventListener('click', clickHandler)

	initGoogleAuth().catch((err) => {
		console.error('Failed to initialize Google Auth:', err)
	})

	console.log('Login page events attached')
}

/**
 * Detach event listeners for the login page.
 * Removes handlers for form submissions and button clicks.
 * Also cleans up Google Auth button.
 * Logs detachment status to the console.
 * @returns {void}
 */
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

/**
 * Initialize Google Auth button.
 * Loads the Google API script, configures the button, and sets up the callback.
 * Renders the Google Sign-In button in the designated container.
 * Google manages its own events internally.
 * @returns {Promise<void>}
 */
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

/**
 * Cleanup Google Auth button.
 * Removes the Google Sign-In button from the container and cancels any ongoing processes.
 * Logs cleanup status to the console.
 * @returns {void}
 */
export function cleanupGoogleAuth() {
	const btnContainer = document.getElementById('google-btn-container')
	if (btnContainer) {
		btnContainer.replaceChildren()
	}

	if (window.google?.accounts?.id) window.google.accounts.id.cancel()

	console.log('Google Auth cleaned up')
}

/**
 * Switch from login form to 2FA form
 */
export function switchTo2FAForm() {
	const loginForm = document.getElementById('login_form')
	loginForm?.classList.add('hidden')

	const twoFAForm = document.getElementById('2fa_form')
	twoFAForm?.classList.remove('hidden')
	twoFAForm?.classList.add('flex')

	const codeInput = document.getElementById('2fa_code') as HTMLInputElement
	codeInput?.focus()
}
