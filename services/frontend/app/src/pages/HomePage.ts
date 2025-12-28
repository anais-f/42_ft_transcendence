import { Button } from '../components/Button.js'
import { Input } from '../components/Input.js'
import { LoremSection } from '../components/LoremIpsum.js'
import { showModal, hideModal } from '../components/Modal.js'
import { handleToggleClick, getToggleValue } from '../components/ToggleGroup.js'
import {
	GameConfigModal,
	GAME_CONFIG_MODAL_ID
} from '../events/home/GameConfigModal.js'
import { currentUser } from '../usecases/userStore.js'
import { logout } from '../usecases/userSession.js'
import { handleCreateGame } from '../events/home/createGameHandler.js'
import { handleJoinLobby } from '../events/home/joinLobbyHandler.js'
import { handleSearchUser } from '../events/home/searchUserHandler.js'
import {
	acceptFriendRequest,
	declineFriendRequest,
	fetchAndRenderFriendRequests,
	fetchAndRenderFriendsList
} from '../events/home/friendsHandler.js'
import { MapOptions } from '../api/game/createGame.js'
import { ObstacleType, PaddleShape } from '@pong-shared'

export const HomePage = (): string => {
	const user = currentUser || {
		username: 'Guest',
		avatar: '/avatars/img_default.png'
	}

	return /*html*/ `
  <section class="grid grid-cols-4 gap-10 h-full w-full">

    <div class="col-4-span-flex">
        <h1 class="title_bloc">PROFILE</h1>
        <img src="${user.avatar}" onerror="this.src='/avatars/img_default.png'" alt="User's avatar" class="avatar_style">        
        <h1 class="username_style">${user.username}</h1>
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
					additionalClasses: '!mb-0'
				})}
    </div>

    <div class="col-4-span-flex">
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

    <div class="col-4-span-flex">
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
						type: 'submit',
						additionalClasses: 'mb-4'
					})}
        </form>
        ${LoremSection({
					variant: 'fill'
				})}
        <img src="/assets/images/screamer_boy.png" alt="screamer boy" class="img_style pb-0">
    </div>

    <div class="col-4-span-flex">
        <h1 class="title_bloc">WANTED</h1>
        <form id="search_user_form" data-form="search-user-form" class="form_style">
            ${Input({
							id: 'search-user',
							name: 'search-user',
							placeholder: 'Enter a username to search here',
							type: 'text',
							required: true
						})}
            ${Button({
							id: 'search-btn',
							text: 'Search',
							type: 'submit'
						})}
        </form>
        
        <!-- FRIENDS SECTION -->
        <div id="friends_section" class="flex flex-col flex-1 w-full min-h-0">
            <!-- RELATIONSHIP SECTION -->
            <div id="relationship" class="w-full flex flex-col flex-[70%] min-h-0">
                <h1 class="title_bloc mt-2 !mb-1">RELATIONSHIP</h1>
                <div id="div_friend_list" class="w-full flex-1 border-2 border-black overflow-y-scroll">
                    <ul id="friend_list" class="h-full">
                    	<span class="text-gray-500">Loading friends...</span>
                    </ul>
                </div>
            </div>
            
            <!-- GET IN TOUCH SECTION -->
            <div id="request_friend" class="w-full flex flex-col flex-[30%] min-h-0">
                <h1 class="title_bloc mt-2 !mb-1">GET IN TOUCH</h1>
                <div id="div_request_list" class="w-full flex-1 border-2 border-black overflow-y-scroll">
                    <ul id="request_list" class="h-full">  
                    	<span class="text-gray-500">Loading friend requests...</span>
                    </ul>
                </div>
            </div>
        <!-- END FRIEND SECTION -->
        </div>    
    
    </div>

  </section>
  ${GameConfigModal()}
`
}

let clickHandler: ((e: Event) => Promise<void>) | null = null
let submitHandler: ((e: Event) => Promise<void>) | null = null

/**
 * Initialize the home page by clearing existing friend and request lists.
 * This function prepares the home page for fresh content loading.
 * @returns {Promise<void>} A promise that resolves when initialization is complete.
 */
async function initHomePage(): Promise<void> {
	try {
		console.log('Initializing home page...')
		await fetchAndRenderFriendsList()
		await fetchAndRenderFriendRequests()
	} catch (error) {
		console.error('Network error while fetching friends list:', error)
	}
}

/**
 * Attach event listeners for the home page.
 * Sets up handlers for button clicks such as logout and navigation to settings.
 * Logs attachment status to the console.
 * @returns {Promise<void>} A promise that resolves when event listeners are attached.
 */
export async function attachHomeEvents(): Promise<void> {
	const content = document.getElementById('content')
	if (!content) {
		return
	}

	await initHomePage()

	clickHandler ??= async (e: Event) => {
		const target = e.target as HTMLElement
		const actionButton = target.closest('[data-action]') as HTMLElement

		if (actionButton) {
			e.preventDefault()
			const action = actionButton.getAttribute('data-action')

			if (action === 'logout') await logout()
			if (action === 'navigate-settings') window.navigate('/settings')
			if (action === 'create-game') showModal(GAME_CONFIG_MODAL_ID)
			if (action === 'close-modal') hideModal(GAME_CONFIG_MODAL_ID)
			if (action === 'close-modal-overlay' && target === actionButton)
				hideModal(GAME_CONFIG_MODAL_ID)
			if (action === 'toggle-option') handleToggleClick(actionButton)
			if (action === 'submit-game-config') {
				const mapOptions: MapOptions = {
					paddleShape:
						(getToggleValue('paddleShape') as PaddleShape) ||
						PaddleShape.Classic,
					obstacle:
						(getToggleValue('obstacle') as ObstacleType) || ObstacleType.None
				}
				hideModal(GAME_CONFIG_MODAL_ID)
				await handleCreateGame(mapOptions)
			}
			if (action === 'navigate-profile') {
				const id = actionButton.getAttribute('data-id')
				if (id) window.navigate(`/profile/${id}`)
			}
			if (action === 'accept-friend') {
				const id = actionButton.getAttribute('data-id')
				if (id) await acceptFriendRequest(Number(id))
			}
			if (action === 'decline-friend') {
				const id = actionButton.getAttribute('data-id')
				if (id) await declineFriendRequest(Number(id))
			}
		}
	}

	submitHandler ??= async (e: Event) => {
		const form = e.target as HTMLElement
		e.preventDefault()
		const formName = form.getAttribute('data-form')
		console.log('e submitted form:', form)

		if (formName === 'join-lobby') await handleJoinLobby(e)
		if (formName === 'search-user-form') await handleSearchUser(e)
	}

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
export function detachHomeEvents(): void {
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
