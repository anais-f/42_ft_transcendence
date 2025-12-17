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
