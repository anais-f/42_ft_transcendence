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

export const SettingPage = (): string => {
	const is2FAEnabled = currentUser?.two_fa_enabled || false
	console.log('Rendering SettingsPage, 2FA enabled:', is2FAEnabled)
	const twoFATitle = is2FAEnabled ? 'DISABLE 2FA ?' : 'ENABLE 2FA ?'
	const twoFAButtonText = is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'

	return `
<section class="grid grid-cols-4 gap-11">
	<div class="col-span-1 flex flex-col items-start">
		<h1 class="text-2xl py-4">WOULD LIKE TO ...</h1>
		<div class="news_paragraph">
			<h1 class="text-lg pt-4">Title</h1>
			<p class="text-sm py-2">Ipsum dolore veritatis odio in a. Asesciunt. Voluptates dolores doloremque. Beatae quii aliquam qui commodi. Eveniet possimus voluptas voluptatem.</p>
		</div>
		<h1 class="text-2xl py-4">CHANGE USERNAME ?</h1>
	
		<form id="change_username_form" data-form="username_form" class="flex flex-col gap-2 w-full">
			<input id="change_username" type="text" name="change_username" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="USERNAME" required>
			<button id="change_username_btn" class="generic_btn mt-4" type="submit">Save it</button>
		</form>
	
		<div class="news_paragraph">
			<h1 class="text-lg pt-4">Title</h1>
			<p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi.  Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi.  Consectetur minus maiores qui.  Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae.</p>
		</div>
	</div>
	
	<div class="col-span-1 flex flex-col items-start">
		<div class="news_paragraph">
			<p class="text-sm py-6">Ipsum dolore veritatis odio in ipsa corrupti aliqu
		</div>
		<img src="/assets/images/paddle.png" alt="paddle" class="w-full object-cover opacity-50 select-none">
		<h1 class="text-2xl pt-8 pb-1">CHANGE PASSWORD ?</h1>
		
		<form id="change_password_form" data-form="password_form" class="flex flex-col gap-2 w-full">
			<input id="old_password" type="password" name="old_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="OLD PASSWORD" required>
			<input id="new_password" type="password" name="new_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="NEW PASSWORD" required>
			<input id="confirm_new_password" type="password" name="confirm_new_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="CONFIRM NEW PASSWORD" required>
			
${is2FAEnabled ? '<input id="password_2fa_code" type="text" name="password_2fa_code" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="2FA CODE" required maxlength="6" pattern="[0-9]{6}">' : ''}
			<button id="change_password_btn" class="generic_btn mt-4" type="submit">Save it</button>
		</form>
		
	</div>


	<div class="col-span-1 flex flex-col items-start">
		<div class="news_paragraph">
			<p class="text-sm pt-6 pb-2">Ipsum doloores qui. Eos debitis officia. Aui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat.</p>
		</div>
		<h1 class="text-2xl pt-4 pb-1">CHANGE AVATAR ?</h1>
		<form id="change_avatar_form" data-form="avatar_form" class="flex flex-col gap-2">
			<input id="change_avatar" type="file" name="avatar" class="p-12 border-2 border-dashed text-center border-black bg-inherit w-full font-[Birthstone]" placeholder="AVATAR" required>
			<button id="change_avatar_btn" class="generic_btn mt-4" type="submit">Save it</button>
		</form>
		<div class="news_paragraph">
			<h1 class="text-lg pt-4">Title</h1>
			<p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui.  Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi.</p>
		</div>
	</div>

	<div class="col-span-1 flex flex-col items-start">
		<div id="manage_2fa" class="w-full">
			<h1 class="text-2xl pt-8 pb-1">${twoFATitle}</h1>

			${
				is2FAEnabled
					? // DISABLE 2FA - Formulaire simple
						`<form id="disable_2fa_form" data-form="disable_2fa_form" class="flex flex-col gap-2 w-full">
					<input id="disable_2fa_code" type="text" name="code" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="2FA CODE" required maxlength="6" pattern="[0-9]{6}">
					<input id="disable_2fa_password" type="password" name="password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
					<button id="disable_2fa_btn" class="generic_btn mt-4" type="submit">Disable 2FA</button>
				</form>`
					: // ENABLE 2FA - Flow en deux étapes
						`<!-- Étape 1 : Générer le QR code -->
				<div id="generate_qr_step">
					<button id="generate_qr_btn" class="gen	eric_btn mt-4" type="button">Generate QR Code</button>
				</div>

				<!-- Étape 2 : Vérifier et activer (caché par défaut, affiché après génération) -->
				<div id="verify_2fa_step" style="display: none;">
					<div id="qr_code_container" class="my-4 flex flex-col gap-2">
						<!-- Le QR code sera inséré ici par JavaScript -->
					</div>
					<form id="enable_2fa_form" data-form="enable_2fa_form" class="flex flex-col gap-2 w-full">
						<input id="enable_2fa_code" type="text" name="code" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="2FA CODE" required maxlength="6" pattern="[0-9]{6}">
						<input id="enable_2fa_password" type="password" name="password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
						<button id="enable_2fa_btn" class="generic_btn mt-4" type="submit">Verify & Enable</button>
					</form>
				</div>`
			}
		</div>
		
		<img src="/assets/images/tiger.png" alt="tiger" class="w-full object-cover opacity-50 select-none">
		
		<div class="news_paragraph">
			<h1 class="text-lg pt-6">Title</h1>
			<p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Nam perferendis facilis asperiores ea qui voluptates dolor eveniet. Omnis voluptas et ut est porro soluta ut est.</p>
		</div>
	</div>
	
</section>
`
}

let submitHandler: ((e: Event) => Promise<void>) | null = null
let clickHandler: ((e: Event) => Promise<void>) | null = null

export function attacholdSettingsEvents() {
	const content = document.getElementById('content')
	if (!content) return

	submitHandler = async (e: Event) => {
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

	clickHandler = async (e: Event) => {
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

export function detacholdSettingsEvents() {
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
