import { checkAuth } from '../api/authService'
import { setCurrentUser, currentUser } from '../usecases/userStore'
import { UsernameSchema } from '@common/DTO/usersSchema.js'

export const SettingsPage = (): string => {
	// Use currentUser from store - will be null on public routes
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

			${is2FAEnabled ?
				// DISABLE 2FA - Formulaire simple
				`<form id="disable_2fa_form" data-form="disable_2fa_form" class="flex flex-col gap-2 w-full">
					<input id="disable_2fa_code" type="text" name="code" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="2FA CODE" required maxlength="6" pattern="[0-9]{6}">
					<input id="disable_2fa_password" type="password" name="password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
					<button id="disable_2fa_btn" class="generic_btn mt-4" type="submit">Disable 2FA</button>
				</form>`
				:
				// ENABLE 2FA - Flow en deux étapes
				`<!-- Étape 1 : Générer le QR code -->
				<div id="generate_qr_step">
					<button id="generate_qr_btn" class="generic_btn mt-4" type="button">Generate QR Code</button>
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

// Store event handler references for cleanup
let submitHandler: ((e: Event) => Promise<void>) | null = null
let clickHandler: ((e:Event) => Promise<void>) | null = null

export function attachSettingsEvents() {
  const content = document.getElementById('content')
  if (!content) return

  // Create and store the submit handler
  submitHandler = async (e: Event) => {
    e.preventDefault()
    const form = (e.target as HTMLElement).closest('form[data-form]')
    if (!form) return

    const formName = form.getAttribute('data-form')

    if (formName === 'username_form') await handleUsername(form as HTMLFormElement)
    if (formName === 'password_form') await handleChangePassword(form as HTMLFormElement)
    if (formName === 'avatar_form') await handlerAvatar(form as HTMLFormElement)
    if (formName === 'enable_2fa_form') await handleEnable2FA(form as HTMLFormElement)
    if (formName === 'disable_2fa_form') await handleDisable2FA(form as HTMLFormElement)
  }

  clickHandler = async (e: Event) => {
    const target = e.target as HTMLElement
    if (target?.id === 'generate_qr_btn') {
      e.preventDefault()
      await handleGenerateQRCode()
    }
  }

  // Attach handlers
  content.addEventListener('submit', submitHandler)
  content.addEventListener('click', clickHandler)


  console.log('Settings page events attached')
}

export function detachSettingsEvents() {
  const content = document.getElementById('content')

  // Remove submit handler
  if (content && submitHandler) {
    content.removeEventListener('submit', submitHandler)
    submitHandler = null
  }

  // Remove click handler
  if (content && clickHandler) {
    content.removeEventListener('click', clickHandler)
    clickHandler = null
  }

  console.log('Settings page events detached')
}

export async function handleUsername(form: HTMLFormElement) {
  const formData = new FormData(form)
  const newUsername = formData.get('change_username') as string

  // Validation with Zod
  const validation = UsernameSchema.safeParse(newUsername)
  if (!validation.success) {
    console.log('Invalid username:', validation.error.errors)
    return
  }

  const validatedUsername = validation.data

  try {
    const res = await fetch('/users/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ username: validatedUsername })
    })


    const result = await res.json()
    if (!res.ok) {
      alert(result.message || 'Failed to change username. Please try again.')
      console.error('Failed to change username:', res.status, result)
      return
      // TODO : manage different error cases
    }
    console.log('Username changed successfully:', result)

    // Synchronize user state with backend
    const updatedUser = await checkAuth()
    if (!updatedUser) {
      console.error('Failed to fetch updated user data after username change.')
      return
    }
    setCurrentUser(updatedUser)

    // Feedback utilisateur
    alert('Username changed successfully!')
    form.reset()

  } catch (error) {
    console.error('Error changing username:', error)
  }
}

export async function handlerAvatar(form: HTMLFormElement) {
  const formData = new FormData(form)
  const avatarFile = formData.get('avatar') as File

  if (!avatarFile || !(avatarFile instanceof File)) {
    console.log('No file selected or invalid file.')
    return
  }

  // TODO: check file type and size before uploading

  try {
    const res = await fetch('/users/api/users/me/avatar', {
      method: 'PATCH',
      credentials: 'include',
      body: formData
    })

    const result = await res.json()
    if (!res.ok) {
      alert(result.message || 'Failed to get avatar.')
      console.error('Failed to upload avatar:', res.status, result)
      return
      // TODO : manage different error cases
    }
    console.log('Avatar uploaded successfully:', result)

    // Synchronize user state with backend
    const updatedUser = await checkAuth()
    if (!updatedUser) {
      console.error('Failed to fetch updated user data after avatar upload.')
      return
    }
    setCurrentUser(updatedUser)

    // Feedback utilisateur
    alert('Avatar changed successfully!')
    form.reset()

  } catch (error) {
    console.error('Error uploading avatar:', error)
  }
}

export async function handleChangePassword(form: HTMLFormElement) {
  const formData = new FormData(form)
  const oldPassword = formData.get('old_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmNewPassword = formData.get('confirm_new_password') as string
  const twofaCode = formData.get('password_2fa_code') as string | null

  // Client-side validation
  if (newPassword !== confirmNewPassword) {
    alert('New password and confirmation do not match.')
    return
  }

  if (newPassword.length < 8) {
    alert('New password must be at least 8 characters long.')
    return
  }

  try {
    const body: {
      old_password: string
      new_password: string
      twofa_code?: string
    } = {
      old_password: oldPassword,
      new_password: newPassword
    }

    // Add 2FA code if provided
    if (twofaCode) {
      body.twofa_code = twofaCode
    }

    const res = await fetch('/auth/api/user/me/password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    })

    const result = await res.json()

    if (!res.ok) {
      alert(result.message || result.error || 'Failed to change password. Please try again.')
      console.error('Failed to change password:', res.status, result)
      return
    }

    console.log('Password changed successfully:', result)
    alert('Password changed successfully!')
    form.reset()

  } catch (error) {
    console.error('Error changing password:', error)
    alert('An error occurred while changing password. Please try again.')
  }
}

// 2FA HANDLERS

/**
 * Verify the current user's password using JWT
 * @param password - The password to verify
 * @returns true if password is valid, false otherwise
 */
async function verifyCurrentUserPassword(password: string): Promise<boolean> {
  try {
    const res = await fetch('/auth/api/verify-my-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ password })
    })

    if (!res.ok) {
      console.error('Password verification failed:', res.status)
      alert('Invalid password. Please try again.')
      return false
    }

    return true
  } catch (error) {
    console.error('Error verifying password:', error)
    alert('An error occurred while verifying password.')
    return false
  }
}

/**
 * Generate the 2FA QR code and otpauth_url
 * Use POST /auth/api/2fa/setup
 */
async function handleGenerateQRCode() {
  try {
    console.log('Generating 2FA QR code...')

    if (!currentUser) {
      alert('User not authenticated')
      return
    }

    const res = await fetch('/auth/api/2fa/setup', {
      method: 'POST',
      credentials: 'include'
    })

    if (!res.ok) {
      const error = await res.json()
      console.error('Failed to generate QR code:', error)
      alert('Failed to generate QR code. Please try again.')
      return
    }

    const data = await res.json()
    // Format received: { otpauth_url: string, qr_base64: string, expires_at: string }
    console.log('QR code generated successfully:', data)

    // Display the QR code and otpauth_url in the UI
    const qrContainer = document.getElementById('qr_code_container')
    const generateStep = document.getElementById('generate_qr_step')
    const verifyStep = document.getElementById('verify_2fa_step')

    if (qrContainer && generateStep && verifyStep) {
      // Insert QR code and URL into the container
      qrContainer.innerHTML = `
        <div class="flex flex-col gap-2 items-center w-full">
          <p class="text-sm">Scan this QR code with Google Authenticator:</p>
          <img src="${data.qr_base64}" alt="QR Code" class="w-64 h-64 border-2 border-black">
          <p class="text-xs mt-2">Or copy this URL:</p>
          <input
            type="text"
            value="${data.otpauth_url}"
            readonly
            class="text-xs px-2 py-1 border border-black w-full font-mono"
            onclick="this.select()"
          >
          <p class="text-xs opacity-50 mt-2">Expires in 5 minutes</p>
        </div>
      `

      // Hide the button step, show the verification step
      generateStep.style.display = 'none'
      verifyStep.style.display = 'block'
    }

  } catch (error) {
    console.error('Error generating QR code:', error)
    alert('An error occurred. Please try again.')
  }
}

/**
 * Enable the 2FA after verifying the code
 * 2-step verification: 1) Verify password 2) Verify 2FA code and enable
 * Utilise: POST /auth/api/verify-my-password + POST /auth/api/2fa/verify-setup
 * @param form
 * @returns Promise<void>
 */
async function handleEnable2FA(form: HTMLFormElement) : Promise<void> {
  const formData = new FormData(form)
  const code = formData.get('code') as string
  const password = formData.get('password') as string

  if (!currentUser) {
    alert('User not authenticated')
    return
  }

  try {
    console.log('Step 1: Verifying password...')

    // STEP 1: Verify password using JWT
    if (!(await verifyCurrentUserPassword(password))) {
      return
    }

    console.log('Step 2: Verifying 2FA code and enabling 2FA...')

    // STEP 2: Verify 2FA code (this also enables 2FA and updates two_fa_enabled flag)
    const res = await fetch('/auth/api/2fa/verify-setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        twofa_code: code
      })
    })

    const result = await res.json()
    if (!res.ok) {
      console.error('Failed to enable 2FA:', result)
      alert(result.message || 'Invalid 2FA code. Please try again.')
      return
    }

    console.log('2FA enabled successfully:', result)

    // update user and refresh page to show "DISABLE 2FA" form
    const updatedUser = await checkAuth()
    if (!updatedUser) {
      console.error('Failed to fetch updated user data.')
      return
    }
    setCurrentUser(updatedUser)
    console.log('Updated user after enabling 2FA:', updatedUser)


    alert('Two-Factor Authentication enabled successfully!')
    window.location.reload()

  } catch (error) {
    console.error('Error enabling 2FA:', error)
    alert('An error occurred. Please try again.')
  }
}

/**
 * Disable the 2FA after verifying the code
 * 2-step verification: 1) Verify password 2) Disable 2FA with code
 * Utilise: POST /auth/api/verify-my-password + DELETE /auth/api/2fa/disable
 * @param form
 * @returns Promise<void>
 */
async function handleDisable2FA(form: HTMLFormElement) {
  const formData = new FormData(form)
  const code = formData.get('code') as string
  const password = formData.get('password') as string

  if (!currentUser) {
    alert('User not authenticated')
    return
  }

  try {
    console.log('Step 1: Verifying password...')

    // STEP 1: Verify password using JWT
    if (!(await verifyCurrentUserPassword(password))) {
      return
    }

    console.log('Step 2: Disabling 2FA...')

    // STEP 2: Disable 2FA (also updates two_fa_enabled flag)
    const res = await fetch('/auth/api/2fa/disable', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        twofa_code: code
      })
    })

    const result = await res.json()
    if (!res.ok) {
      console.error('Failed to disable 2FA:', result)
      alert(result.message || 'Invalid 2FA code. Please try again.')
      return
    }

    console.log('2FA disabled successfully:', result)

    // update user and refresh page to show "ENABLE 2FA" form
    const updatedUser = await checkAuth()
    if (!updatedUser) {
      console.error('Failed to fetch updated user data.')
      return
    }
    setCurrentUser(updatedUser)

    alert('Two-Factor Authentication disabled successfully!')
    window.location.reload()

  } catch (error) {
    console.error('Error disabling 2FA:', error)
    alert('An error occurred. Please try again.')
  }
}