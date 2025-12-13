import { handleLogin, handleRegister } from '../events/loginPageHandlers.js'
import { checkAuth } from '../api/authService.js'
import { setCurrentUser } from '../usecases/userStore.js'
import { CredentialResponse } from '../types/google-type.js'
import {
	loadGoogleScript,
	loginWithGoogleCredential
} from '../api/authService.js'

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
        <form id="login_form" data-form="login" class="flex flex-col gap-2">
        <input id="login_username" type="text" name="login_username" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="USERNAME" required>
        <input id="login_password" type="password" name="login_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
        <button id="login_btn" class="generic_btn mt-4" type="submit">Login</button>

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

export function attachLoginEvents() {
	const content = document.getElementById('content')
	if (!content) return

	content.addEventListener('submit', async (e) => {
		const form = (e.target as HTMLElement).closest('form[data-form]')
		if (!form) return

		e.preventDefault()
		const formName = form.getAttribute('data-form')
		if (formName === 'register') await handleRegister(form as HTMLFormElement)
		if (formName === 'login') await handleLogin(form as HTMLFormElement)
	})

	content.addEventListener('click', (e) => {
		const target = e.target as HTMLElement

		const actionButton = target.closest('[data-action]')
		if (actionButton) {
			const action = actionButton.getAttribute('data-action')
		}
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
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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
		console.error('Impossible to load Google API script', e)
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
