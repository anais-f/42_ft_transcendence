import { Button } from '../components/Button.js'
import { Input } from '../components/Input.js'
import { LoremSection } from '../components/LoremIpsum.js'
import { currentUser } from '../usecases/userStore.js'

export const TestPage = (): string => {
	const user = currentUser || {
		username: 'Guest',
		avatar: '/avatars/img_default.png'
	}
	const login = user.username // TODO : get actual login credential

	return /*html*/ `
  <section class="grid grid-cols-4 gap-10 h-full w-full">

    <div class="bg-gray-100 col-4-span-flex">
        <h1 class="title_bloc">PROFILE</h1>
        <img src="${user.avatar}" onerror="this.src='/avatars/img_default.png'" alt="User's avatar" class="avatar_style">        
        <h1 class="username_style">${user.username}</h1>
        <p class="font-special text-sm mb-4">Reminder your login credential is : ${login}</p>
        ${LoremSection({
					variant: 'fill'
				})}
        ${Button({
					id: 'settings_btn',
					text: 'Settings',
					type: 'button',
					action: 'navigate-settings',
					additionalClasses: 'mt-4'
				})}
        ${Button({
					id: 'logout_btn',
					text: 'Logout',
					type: 'button',
					action: 'logout',
					additionalClasses: 'mb-0'
				})}
    </div>

    <div class="bg-blue-100 col-4-span-flex">
        ${LoremSection({
					title: 'Welcome Home',
					variant: 'medium'
				})}
        <h1 class="title_bloc mt-4">ARE YOU READY ?</h1>
        ${Button({
					id: 'create_game_btn',
					text: 'Create game',
					type: 'button',
					action: 'create-game'
				})}
	      ${Button({
					id: 'tournament_btn',
					text: 'Create tournament',
					type: 'button',
					action: 'create-tournament',
					additionalClasses: 'mb-4'
				})}
        ${LoremSection({
					variant: 'fill'
				})}
    </div>

    <div class="bg-yellow-100 col-4-span-flex">
        ${LoremSection({
					variant: 'short'
				})}
        <h1 class="title_bloc mt-4">FEELING LONELY ?</h1>
        <p class="font-special text-sm mb-4">You can join a game by entering the lobby code below</p>
        <form id="join_lobby_form" data-form="join-lobby" class="form_style">
          ${Input({
						id: 'join_lobby',
						name: 'join_lobby',
						placeholder: 'Game code',
						type: 'text',
						required: true
					})}
          ${Button({
						id: 'join_btn',
						text: 'Join',
						type: 'submit'
					})}
        </form>
        ${LoremSection({
					variant: 'fill'
				})}
        <img src="/assets/images/screamer_boy.png" alt="screamer boy" class="img_style pb-0">
    </div>

    <div class="bg-yellow-100 col-4-span-flex">
        ${LoremSection({
					variant: 'fill'
				})}
    </div>

  </section>
`
}
