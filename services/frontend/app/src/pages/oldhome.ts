import { Button } from '../components/Button.js'
import { Input } from '../components/Input.js'
import { handleCreateGame } from '../events/home/createGameHandler.js'
import { handleJoinLobby } from '../events/home/joinLobbyHandler.js'
import { handleLogin } from '../events/loginPageHandlers.js'
import { logout } from '../usecases/userSession.js'
import { currentUser } from '../usecases/userStore.js'

export const HomePage = (): string => {
	const user = currentUser || {
		username: 'Guest',
		avatar: '/avatars/img_default.png'
	}

	return /*html*/ `
<div class="grid grid-cols-4 gap-11">

	<div class="col-span-1 flex flex-col items-start">
		<h1 class="text-2xl py-4">PROFILE</h1>
		<img src="${user.avatar}" onerror="this.src='/avatars/img_default.png'" alt="User's avatar" class="w-full object-cover border-2 border-black saturate-[75%] contrast-[100%]">
		<h1 class="text-2xl py-6">${user.username}</h1>
		<div class="news_paragraph">
			<h1 class="text-lg py-2">Title</h1>
			<p class="text-sm pb-2">Ipsum d debeeserun sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt.</p>
		</div>
		<button id="settings_btn" data-action="navigate-settings" type="button" class="generic_btn my-2">Settings</button>
		<button id="logout_btn" data-action="logout" type="button" class="generic_btn">Logout</button>
	</div>
	
	
	<div class="col-span-1">
		<div class="news_paragraph pt-4">
			<h1 class="text-lg py-2">Title</h1>
			<p class="text-sm pb-2">Ipst quam. Euidem nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt.</p>
		</div>
		<h1 class="text-2xl py-4">ARE YOU READY ?</h1>
		${Button({
			id: 'create_game_btn',
			text: 'create-game',
			type: 'button',
			action: 'create-game'
		})}
		${Button({ id: 'tournament_btn', text: 'Tournament', type: 'button' })}
		<div class="news_paragraph">
			<h1 class="text-lg py-2">Title</h1>
			<p class="text-sm pb-2">Ipeat. Ipsum dolore vericorrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt.</p>
		</div>
	</div>
	
	
	<div class="col-span-1">
		 <div class="news_paragraph pt-8">
			<p class="text-sm pb-2">Assumenda repreemque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui.</p>
		</div>
		<h1 class="text-2xl py-2">FEELING LONELY ?</h1>
		<p class="text-lg">You can join a game by enter the lobby code below</p>
		<form id="join_lobby_form" data-form="join-lobby" class="flex flex-col gap-2">
			 ${Input({
					id: 'join_lobby',
					name: 'join_lobby',
					placeholder: 'Game code',
					type: 'text',
					required: true
				})}
			 ${Button({ id: 'join_btn', text: 'Join', type: 'submit' })}
		 </form>
		<div class="news_paragraph pt-4">
			<h1 class="text-lg py-2">Title</h1>
			<p class="text-sm pb-2">The head of our team during the project development</p>
		</div>
		<img src="/assets/images/screamer_boy.png" alt="screamer boy" class="w-full object-cover opacity-50 select-none">
	</div>
	
	
	<div class="col-span-1">
		 <h1 class="text-2xl pt-4 pb-1">WANTED</h1>
		 <form id="search_usr_form" class="flex flex-col gap-2" action="">
			 <input id="search_usr" type="text" name="search_usr" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="ENTER A USERNAME TO SEARCH HERE" required>
			 <button id="search_btn" class="generic_btn" type="submit">Search</button>
		 </form>
		 
		 <h1 class="text-2xl pt-6">RELATIONSHIP</h1>
		 <div class="w-full h-[48%] border-2 border-black py-2">
			<ul class="overflow-y-scroll">
				<li class="flex flex-row justify-start border-b-2 border-black">
					<img src=${fr1.avatar} alt=${fr1.alt} class=" w-[10%] aspect-square object-cover border-1 border-black m-4">
					<div class="m-4">
						<p>${fr1.username}</p>
						<p class="text-gray-500">${fr1.status}</p>
					</div>
				</li>
				<li class="flex flex-row justify-start border-b-2 border-black">
					<img src=${fr2.avatar} alt=${fr2.alt} class=" w-[10%] aspect-square object-cover border-1 border-black m-4">
					<div class="m-4">
						<p>${fr2.username}</p>
						<p class="text-gray-500">${fr2.status}</p>
					</div>
				</li>
				<li class="flex flex-row justify-start border-b-2 border-black">
					<img src=${fr3.avatar} alt=${fr3.alt} class=" w-[10%] aspect-square object-cover border-1 border-black m-4">
					<div class="m-4">
						<p>${fr3.username}</p>
						<p class="text-gray-500">${fr3.status}</p>
					</div>
				</li>
				<li class="flex flex-row justify-start border-b-2 border-black">
					<img src=${fr4.avatar} alt=${fr4.alt} class=" w-[10%] aspect-square object-cover border-1 border-black m-4">
					<div class="m-4">
						<p>${fr4.username}</p>
						<p class="text-gray-500">${fr4.status}</p>
					</div>
				</li>
			</ul>
		 </div>
		 <h1 class="text-2xl pt-6">GET IN TOUCH</h1>
		<div class="w-full h-[20%] border-2 border-black py-2">
			<ul class="overflow-y-scroll">
				<li class="flex flex-row justify-start border-b-2 border-black">
					<img src=${fr1.avatar} alt=${fr1.alt} class=" w-[10%] aspect-square object-cover border-1 border-black m-4">
					<div class="m-4">
						<p>${fr1.username}</p>
						<div class="flex flex-row w-full justify-between gap-4">
							<button id="accept_fr_btn" type="button" class="generic_btn text-xs px-4 py-1 flex-1 w-20">Accept</button>
							<button id="decline_fr_btn" type="button" class="generic_btn text-xs px-4 py-1 flex-1 w-20">Decline</button>
						</div>
					</div>
				</li>
			</ul>
		 </div>
	</div>
</div>
`
}

let clickHandler: ((e: Event) => Promise<void>) | null = null
let submitHandler: ((e: Event) => Promise<void>) | null = null

/**
 * Attach event listeners for the home page.
 * Sets up handlers for button clicks such as logout and navigation to settings.
 * Logs attachment status to the console.
 * @returns {void}
 */
export function attachHomeEvents() {
	const content = document.getElementById('content')
	if (!content) {
		return
	}

	// Create and store the click handler
	clickHandler = async (e: Event) => {
		const target = e.target as HTMLElement
		const actionButton = target.closest('[data-action]')

		if (actionButton) {
			const action = actionButton.getAttribute('data-action')

			if (action === 'logout') {
				await logout()
			}

			if (action === 'navigate-settings') {
				window.navigate('/settings')
			}

			if (action === 'create-game') {
				await handleCreateGame()
			}
		}
	}

	submitHandler = async (e: Event) => {
		const form = e.target as HTMLElement
		const formName = form.getAttribute('data-form')

		if (formName === 'join-lobby') handleJoinLobby(e)
	}

	// Attach the handler
	content.addEventListener('click', clickHandler)
	content.addEventListener('submit', submitHandler)

	console.log('Home page events attached')
}

/**
 * Detach event listeners for the home page.
 * Removes handlers for button clicks to prevent memory leaks.
 * Logs detachment status to the console.
 * @returns {void}
 */
export function detachHomeEvents() {
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

	console.log('Home page events detached')
}

const fr1 = {
	username: 'Anfichet',
	avatar: '/assets/images/bear.png',
	alt: 'Nanou_avatar',
	status: 'Online'
}

const fr2 = {
	username: 'Mjuffard',
	avatar: '/assets/images/bear.png',
	alt: 'Mich_avatar',
	status: 'Online'
}

const fr3 = {
	username: 'Lrio',
	avatar: '/assets/images/bear.png',
	alt: 'Lohhiiccc_avatar',
	status: 'Offline'
}

const fr4 = {
	username: 'Jdoe',
	avatar: '/assets/images/img_default.png',
	alt: 'John_avatar',
	status: 'Offline'
}
