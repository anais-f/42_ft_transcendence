import { checkAuth } from '../api/authService'
import { setCurrentUser, currentUser } from '../usecases/userStore'
import { UsernameSchema } from '@common/DTO/usersSchema.js'
import { IPrivateUser } from '@common/interfaces/usersModels.js'


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
			<form id="manage_2fa_form" class="flex flex-col gap-2 w-full">
				<input id="manage_2fa_code" type="text" name="manage_2fa_code" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="2FA CODE" required>
				<input id="manage_2fa_password" type="password" name="manage_2fa_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
				<button id="manage_2fa_btn" class="generic_btn mt-4" type="submit">${twoFAButtonText}</button>
			</form>
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

export function attachSettingsEvents() {
  const content = document.getElementById('content')
  if (!content) return

  content.addEventListener('submit', async (e) => {
    const form = (e.target as HTMLElement).closest('form[data-form]')
    if (!form) return

    e.preventDefault()
    const formName = form.getAttribute('data-form')

    if (formName === 'username_form') {
      await handleUsername(form as HTMLFormElement)
    }
    if (formName === 'password_form') {
      // Handle change password
    }
    if (formName === 'avatar_form') {
      await handlerAvatar(form as HTMLFormElement)
    }

  })

  console.log('Settings page events attached')
}


export async function handleUsername(form: HTMLFormElement) {
  const formData = new FormData(form)
  const newUsername = formData.get('change_username') as string

  // Validation avec Zod
  const validation = UsernameSchema.safeParse(newUsername)
  if (!validation.success) {
    console.log('Invalid username:', validation.error.errors)
    return
    // afficher les erreurs en messages frontend
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
      console.error('Failed to change username:', res.status, result)
      return
      // faire if ou switch case avec les erreurs possibles
    }
    console.log('Username changed successfully:', result)

    // Synchroniser l'état utilisateur avec le backend
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

  // verif taille et type de fichier si besoin

  try {
    // Plus besoin de renommer ! Le FormData contient déjà 'avatar'
    const res = await fetch('/users/api/users/me/avatar', {
      method: 'PATCH',
      credentials: 'include',
      body: formData // Utilise directement formData sans modification
    })

    const result = await res.json()
    if (!res.ok) {
      console.error('Failed to upload avatar:', res.status, result)
      return
      // faire if ou switch case avec les erreurs possibles
    }
    console.log('Avatar uploaded successfully:', result)

    // Synchroniser l'état utilisateur avec le backend
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

