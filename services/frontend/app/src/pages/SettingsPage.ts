import { Button } from '../components/Button.js'
import { Input } from '../components/Input.js'
import { LoremSection } from '../components/LoremIpsum.js'
import { currentUser } from '../usecases/userStore.js'
import {
	handleUsername,
	handleChangePassword,
	handlerAvatar
} from '../events/settings/settingsPageHandlers.js'
import {
	handleGenerateQRCode,
	handleEnable2FA,
	handleDisable2FA
} from '../events/settings/settings2FAPageHandlers.js'

export const SettingsPage = (): string => {
	const is2FAEnabled = currentUser?.two_fa_enabled || false
	const isGoogleUser = currentUser?.is_google_user || false
	console.log('current user', currentUser)
	console.log('Rendering SettingsPage')
	const twoFATitle = is2FAEnabled ? 'DISABLE 2FA ?' : 'ENABLE 2FA ?'

	return /*html*/ `
  <section class="grid grid-cols-4 gap-10 h-full w-full">

  	<div class="col-4-span-flex">
  		<h1 class="title_bloc">WOULD LIKE TO ...</h1>
  		${LoremSection({
				variant: 'short',
				additionalClasses: 'mb-4'
			})}
  		<h1 class="title_bloc">CHANGE USERNAME ?</h1>
  		<form id="change_username_form" data-form="username_form" class="form_style">
  			${Input({
					id: 'change_username',
					name: 'change_username',
					placeholder: 'New Username',
					type: 'text',
					required: true
				})}
				${Button({
					text: 'Save it',
					id: 'change_username_btn',
					type: 'submit',
					additionalClasses: 'form_button'
				})}
  		</form>
  		${LoremSection({
				title: 'New Lifestyle',
				variant: 'fill'
			})}
  	</div>

   	<div class="col-4-span-flex">
   		<img src="/assets/images/paddle.png" alt="paddle" class="img_style py-0 mb-4 flex-shrink min-h-0">
			<div class=" ${isGoogleUser ? 'hidden' : ''}">
				${LoremSection({
					variant: 'xs',
					additionalClasses: 'mb-4'
				})}
				<h1 class="title_bloc">CHANGE PASSWORD ?</h1>
  			<form id="change_password_form" data-form="password_form" class="form_style">
					${Input({
						id: 'old_password',
						name: 'old_password',
						placeholder: 'Old Password',
						type: 'password',
						required: true
					})}
					${Input({
						id: 'new_password',
						name: 'new_password',
						placeholder: 'New Password',
						type: 'password',
						required: true
					})}
					${Input({
						id: 'confirm_new_password',
						name: 'confirm_new_password',
						placeholder: 'Confirm New Password',
						type: 'password',
						required: true
					})}
					${
						is2FAEnabled
							? Input({
									id: 'password_2fa_code',
									name: 'password_2fa_code',
									placeholder: '2FA Code',
									type: 'text',
									required: true,
									maxLength: 6,
									pattern: '[0-9]{6}'
								})
							: ''
					}
				${Button({
					text: 'Save it',
					id: 'change_password_btn',
					type: 'submit',
					additionalClasses: 'form_button'
				})}
				</form>
			</div>   		 		
			${LoremSection({
				variant: 'fill'
			})}
   	</div>

   	<div class="col-4-span-flex">
   		${LoremSection({
				title: 'Security First',
				variant: 'short',
				additionalClasses: 'mb-4'
			})}
	 		<h1 class="title_bloc">CHANGE AVATAR ?</h1>
	 		<form id="change_avatar_form" data-form="avatar_form" class="form_style">
				${Input({
					id: 'change_avatar',
					name: 'change_avatar',
					placeholder: 'Avatar',
					type: 'file',
					required: true,
					additionalClasses:
						'p-12 border-2 border-dashed text-center file:hidden'
				})}
				${Button({
					text: 'Save it',
					id: 'change_avatar_btn',
					type: 'submit',
					additionalClasses: 'form_button'
				})}
			</form>
			${LoremSection({
				title: 'Avatar Tips',
				variant: 'fill'
			})}
   	</div>

   	<div class="col-4-span-flex">
    	<h1 class="title_bloc">${twoFATitle}</h1>
    	${
				is2FAEnabled
					? // Disable 2FA - Simple form with code and password
						`<form id="disable_2fa_form" data-form="disable_2fa_form" class="form_style">
					${Input({
						id: 'disable_2fa_code',
						name: 'code',
						placeholder: '2FA Code',
						type: 'text',
						required: true,
						maxLength: 6,
						pattern: '[0-9]{6}'
					})}
					${Input({
						id: 'disable_2fa_password',
						name: 'password',
						placeholder: 'Password',
						type: 'password',
						required: !isGoogleUser
					})}
					${Button({
						text: 'Disable 2FA',
						id: 'disable_2fa_btn',
						type: 'submit',
						additionalClasses: 'form_button'
					})}
				</form>`
					: // Enable 2FA - Step 1: Generate QR Code, Step 2: Verify and Enable
						`${Button({
							text: 'Generate QR Code',
							id: 'generate_qr_btn',
							type: 'button',
							additionalClasses: 'form_button'
						})}
						<div id="verify_2fa_step" class="hidden w-full">
							<div id="qr_code_container" class="my-4 flex flex-col gap-2 w-full">
							</div>
							<form id="enable_2fa_form" data-form="enable_2fa_form" class="form_style">
								${Input({
									id: 'enable_2fa_code',
									name: 'code',
									placeholder: '2FA Code',
									type: 'text',
									required: true,
									maxLength: 6,
									pattern: '[0-9]{6}'
								})}
								${Input({
									id: 'enable_2fa_password',
									name: 'password',
									placeholder: 'Password',
									type: 'password',
									required: !isGoogleUser
								})}
								${Button({
									text: 'Verify & Enable',
									id: 'enable_2fa_btn',
									type: 'submit',
									additionalClasses: 'form_button'
								})}
							</form>
						</div>`
			}  	
    	<img src="/assets/images/tiger.png" alt="tiger" class="img_style">
    	${LoremSection({
				variant: 'fill'
			})}
   	</div>

  </section>
  `
}

let submitHandler: ((e: Event) => Promise<void>) | null = null
let clickHandler: ((e: Event) => Promise<void>) | null = null

export async function attachSettingsEvents() {
	const content = document.getElementById('content')
	if (!content) return

	submitHandler ??= async (e: Event) => {
		e.preventDefault()
		const form = (e.target as HTMLElement).closest('form[data-form]')
		if (!form) return

		const formName = form.getAttribute('data-form')

		if (formName === 'username_form')
			await handleUsername(form as HTMLFormElement)
		if (formName === 'password_form')
			await handleChangePassword(form as HTMLFormElement)
		if (formName === 'avatar_form') await handlerAvatar(form as HTMLFormElement)
		if (formName === 'enable_2fa_form')
			await handleEnable2FA(form as HTMLFormElement)
		if (formName === 'disable_2fa_form')
			await handleDisable2FA(form as HTMLFormElement)
	}

	clickHandler ??= async (e: Event) => {
		const target = e.target as HTMLElement
		if (target?.id === 'generate_qr_btn') {
			e.preventDefault()
			await handleGenerateQRCode()
		}
	}

	content.addEventListener('submit', submitHandler)
	content.addEventListener('click', clickHandler)

	console.log('Settings page events attached')
}

export function detachSettingsEvents() {
	const content = document.getElementById('content')

	if (content && submitHandler) {
		content.removeEventListener('submit', submitHandler)
		submitHandler = null
	}

	if (content && clickHandler) {
		content.removeEventListener('click', clickHandler)
		clickHandler = null
	}

	console.log('Settings page events detached')
}
