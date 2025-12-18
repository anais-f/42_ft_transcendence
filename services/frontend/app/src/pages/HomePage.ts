import { Button } from '../components/Button.js'
import { Input } from '../components/Input.js'
import { LoremSection } from '../components/LoremIpsum.js'
import { FriendListItem } from '../components/friends/FriendListItem.js'
import { FriendRequestItem } from '../components/friends/FriendRequestItem.js'
import { currentUser } from '../usecases/userStore.js'

export const TestPage = (): string => {
	const user = currentUser || {
		username: 'Guest',
		avatar: '/avatars/img_default.png'
	}
	const login = 'to-change' // TODO : get actual login credential - voir local storage ?

	return /*html*/ `
  <section class="grid grid-cols-4 gap-10 h-full w-full">

    <div class="col-4-span-flex">
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

    <div class="bg-yellow-100 col-4-span-flex">
        <h1 class="title_bloc">WANTED</h1>
        <form id="search_usr_form" class="form_style" action="">
            ${Input({
							id: 'search_usr',
							name: 'search_usr',
							placeholder: 'Enter a username to search here',
							type: 'text',
							required: true
						})}
            ${Button({
							id: 'search_btn',
							text: 'Search',
							type: 'submit'
						})}
        </form>
        
        <!-- FRIENDS SECTION -->
        <div id="friends_section" class="bg-purple-200 flex flex-col flex-1 w-full min-h-0">
            <!-- RELATIONSHIP SECTION -->
            <div id="relationship" class="bg-yellow-500 w-full flex flex-col flex-[70%] min-h-0">
                <h1 class="title_bloc mt-2 !mb-1">RELATIONSHIP</h1>
                <div id="div_friend_list" class="bg-grey-200 w-full flex-1 border-2 border-black overflow-y-scroll">
                    <ul id="friend_list" class="h-full">  
                        <!-- FRIEND ITEMS POPULATED HERE -->
                        <li class="flex flex-row border-b border-black">
                            <a href="/profile/${fr1.username}" data-action="navigate-profile" data-username="${fr1.username}" class="flex items-center gap-4 py-2 px-4">
                                <img src="${fr1.avatar}" alt="${fr1.username}'s avatar" class="w-12 h-12 object-cover border-black">
                                <div>
                                    <p class="font-medium">${fr1.username}</p>
                                    <p class="text-gray-500">${fr1.status}</p>
                                </div>
                            </a>
                        </li>
                        ${FriendListItem(fr1)}
                        ${FriendListItem(fr2)}
                        ${FriendListItem(fr3)}
                        ${FriendListItem(fr4)}
                        ${FriendListItem(fr1)}
                        ${FriendListItem(fr2)}
                        ${FriendListItem(fr3)}
                        ${FriendListItem(fr4)}
                    </ul>
                </div>
            </div>
            
            <!-- GET IN TOUCH SECTION -->
            <div id="request_friend" class="bg-blue-200 w-full flex flex-col flex-[30%] min-h-0">
                <h1 class="title_bloc mt-2 !mb-1">GET IN TOUCH</h1>
                <div id="div_request_list" class="bg-grey-800 w-full flex-1 border-2 border-black overflow-y-scroll">
                    <ul id="request_list" class="h-full">  
                        ${FriendRequestItem(fr1)}
                        ${FriendRequestItem(fr2)}
                        ${FriendRequestItem(fr3)}
                        ${FriendRequestItem(fr4)}
                    </ul>
                </div>
            </div>
        <!-- END FRIEND SECTION -->
        </div>    
        
    </div>

  </section>
`
}

const fr1 = {
	id: '1',
	username: 'Anfichet',
	avatar: '/assets/images/bear.png',
	status: 'Online'
}

const fr2 = {
	id: '2',
	username: 'Mjuffard',
	avatar: '/assets/images/bear.png',
	status: 'Online'
}

const fr3 = {
	id: '3',
	username: 'Lrio',
	avatar: '/assets/images/bear.png',
	status: 'Offline'
}

const fr4 = {
	id: '4',
	username: 'Jdoe',
	avatar: '/assets/images/img_default.png',
	status: 'Offline'
}
