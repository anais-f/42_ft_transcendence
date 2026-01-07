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
import { ToastActionType } from '../types/toast.js'

export const LoginPage = (): string => {
	return /*html*/ `
	<section class="grid grid-cols-4 gap-10 h-full w-full">
	<div class="col-4-span-flex">
		<h1 class="title_bloc">SUBSCRIBE TO OUR NEWSPAPER</h1>
		<form id="register_form" data-form="register" class="form_style">
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
				type: 'submit',
				additionalClasses: 'form_button'
			})}
		</form>

		${LoremSection({
			title: 'Newsletter',
			variant: 'fill'
		})}
	</div>

	<div class="col-4-span-flex">
		${LoremSection({
			variant: 'long'
		})}
	<img src="/assets/images/mammoth.png" alt="mamouth" class="img_style">
	${LoremSection({
		title: 'Mamamoth',
		variant: 'fill'
	})}
	</div>

	<div class="col-4-span-flex">
		${LoremSection({
			variant: 'short'
		})}
	<h1 class="title_bloc mt-4">RESUME READING</h1>
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
		type: 'submit',
		additionalClasses: 'form_button'
	})}
	</form>
	<form id="2fa_form" data-form="2fa" class="form_style hidden">
		${Input({
			id: '2fa_code',
			name: '2fa_code',
			placeholder: '000000',
			type: 'text',
			required: true,
			maxLength: 6,
			pattern: '[0-9]{6}',
			inputmode: 'numeric',
			additionalClasses: 'tracking-widest text-center letter-spacing-widest'
		})}
		${Button({
			id: '2fa_btn',
			text: 'Validate',
			type: 'submit'
		})}
	</form>
	${LoremSection({
		title: 'Introduction',
		variant: 'fill'
	})}
	</div>
	
	<div class="col-4-span-flex">
		${LoremSection({
			title: 'New Partener',
			variant: 'medium',
			additionalClasses: 'mb-4'
		})}
		<div id="google-btn-container" class="mx-auto my-4 w-fit flex"></div>
			<!-- 2FA Form -->
	<form id="2fa_form_google" data-form="2fa" class="form_style hidden">
		${Input({
			id: '2fa_code',
			name: '2fa_code',
			placeholder: '000000',
			type: 'text',
			required: true,
			maxLength: 6,
			pattern: '[0-9]{6}',
			inputmode: 'numeric',
			additionalClasses: 'tracking-widest text-center letter-spacing-widest'
		})}
		${Button({
			id: '2fa_btn',
			text: 'Validate',
			type: 'submit'
		})}
	</form>
		<img src="/assets/images/screamer_girl.png" alt="screamer girl" class="img_style">
		${LoremSection({
			variant: 'fill'
		})}
	</div>

	</section>
`
}

let submitHandler: ((e: Event) => Promise<void>) | null = null
let clickHandler: ((e: Event) => void) | null = null

export async function attachLoginEvents() {
	const content = document.getElementById('content')
	if (!content) return

	submitHandler ??= async (e: Event) => {
		e.preventDefault()

		const form = (e.target as HTMLElement).closest('form[data-form]')
		if (!form) return

		const formName = form.getAttribute('data-form')
		if (formName === 'register') await handleRegister(form as HTMLFormElement)
		if (formName === 'login') await handleLogin(form as HTMLFormElement)
		if (formName === '2fa') await handle2FASubmit(form as HTMLFormElement)
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
				client_id:
					'310342889284-r3v02ostdrpt7ir500gfl0j0ft1rrnsu.apps.googleusercontent.com',
				callback: async (response: CredentialResponse) => {
					try {
						const { data, error } = await loginWithGoogleCredential(
							response.credential
						)

						if (error) {
							notyf.open({
								type: ToastActionType.ERROR_ACTION,
								message: error
							})
							return
						}

						if (data?.pre_2fa_required) {
							notyf.open({
								type: ToastActionType.INFO_ACTION,
								message: 'Please enter your 2FA code'
							})
							switchTo2FAForm('google-btn-container', '2fa_form_google')
							return
						}

						const authResult = await checkAuth()
						setCurrentUser(authResult)
						window.navigate('/', { skipAuth: true })
					} catch (err) {
						console.error('Google Login Error:', err)
						notyf.open({
							type: ToastActionType.ERROR_ACTION,
							message: 'Connection error with Google'
						})
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

export function switchTo2FAForm(
	originForm: HTMLFormElement,
	finalForm: HTMLFormElement
) {
	const loginForm = document.getElementById(originForm)
	loginForm?.classList.add('hidden')

	const twoFAForm = document.getElementById(finalForm)
	twoFAForm?.classList.remove('hidden')
	twoFAForm?.classList.add('flex')

	const codeInput = document.getElementById('2fa_code') as HTMLInputElement
	codeInput?.focus()
}
