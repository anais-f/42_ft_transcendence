import { Button } from '../components/Button.js'
import { Input } from '../components/Input.js'
import { LoremSection } from '../components/LoremIpsum.js'
import { checkAuth } from '../usecases/userSession.js'
import { setCurrentUser, currentUser } from '../usecases/userStore'
import {
	handleUsername,
	handleChangePassword,
	handlerAvatar
} from '../events/settingsPageHandlers.js'
import {
	handleGenerateQRCode,
	handleEnable2FA,
	handleDisable2FA
} from '../events/settings2FAPageHandlers.js'

// TODO : 2Fa cassé à réparer plus tard

export const TestPage = (): string => {
	const is2FAEnabled = currentUser?.two_fa_enabled || false
	console.log('Rendering SettingsPage, 2FA enabled:', is2FAEnabled)
	const twoFATitle = is2FAEnabled ? 'DISABLE 2FA ?' : 'ENABLE 2FA ?'
	const twoFAButtonText = is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'
	const login = currentUser?.username // TODO : CHANGE FOR REAL LOGIN

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
  		<p class="mb-4 font-special">Reminder of your login credential : ${login}</p>
  		${LoremSection({
				title: 'New Lifestyle',
				variant: 'fill'
			})}
  	</div>

   	<div class="col-4-span-flex">
   		<img src="/assets/images/paddle.png" alt="paddle" class="img_style py-0 mb-4 flex-shrink min-h-0">
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
					additionalClasses: 'p-12 border-2 border-dashed text-center'
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

   	<div class="bg-yellow-100 col-4-span-flex">
    	<h1 class="title_bloc">${twoFATitle}</h1>
    	${is2FAEnabled ?
				// Enable 2FA in 2 steps
				// Step 1: Generate QR Code
    	
    	
   	</div>

  </section>
`
}
