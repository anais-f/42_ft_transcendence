import { createButton } from '../components/button.js'
import { createLink } from '../components/link.js'
import { createImg } from '../components/image.js'
import { createPopupElement, showPopup } from '../components/popUp.js'
import { user } from '../index.js'

export function renderProfile(): HTMLElement {
	const container = document.getElementById('content')
	if (!container) return document.createElement('div')
	container.innerHTML = /*html*/ `
	<section class="pt-2 flex min-h-[80vh]">
		<aside class=" bg-gray-200 flex flex-col w-1/4 items-center justify-between border-4 border-gray-400">
			<div id="img-profile"></div>
			<ul>
				<li class="my-2">${user.username}</li>
				<li class="my-2">Wins ${user.wins}</li>
				<li class="my-2">Losses ${user.losses}</li>
				<li class="my-2">Last Login ${user.lastLogin}</li>
			</ul>
			<section id="btn-settings" class="mb-4">
			</section>
		</aside>
		<main class="flex-1 flex items-center justify-center">
		<section class="bg-gray-100 p-4 w-[40%] h-fit">
			<h1 class="text-center text-blue-800 text-2xl">Play</h1>
			<div class="grid grid-cols-[1fr_0.1fr_1fr] grid-rows-3 gap-4">
				<span class="col-span-3"></span>
				<div id="local">
				</div>
				<div id="remote" class="col-start-3">
				</div>
				<div id="tournament" class="col-span-3">
				</div>
			</div>
		</section>
	</main>
	<section id="friends-requests" class="flex flex-col items-end justify-end gap-1">
	</section>
</div>
</section>
`

	const imgProfile = document.getElementById('img-profile')
	if (!imgProfile) return document.createElement('div')

	const imgProfilePage: HTMLImageElement = createImg({
		src: '/images/acancel.jpg',
		alt: 'user_avatar',
		className:
			'rounded-full w-3/4 aspect-square object-cover flex-shrink-0 border-4 border-gray-400 shadow-xl mx-auto justify-start mt-4',
		title: 'User Avatar'
	})

	const PopupSettings: HTMLImageElement = createImg({
		src: '/images/pong.avif',
		alt: 'settings_image'
	})

	const btnSettings = document.getElementById('btn-settings')
	if (!btnSettings) return document.createElement('div')

	const btnSettingsElement: HTMLButtonElement = createButton({
		name: 'Settings',
		className:
			'bg-gray-300 px-3 py-1 rounded-md border border-gray-400 hover:bg-gray-400 shadow-xl',
		onClick: (ev: MouseEvent) => {
			showPopup(PopupSettings)
		}
	})

	const btnLocal = document.getElementById('local')
	if (!btnLocal) return document.createElement('div')
	const btnLocalElement: HTMLButtonElement = createButton({
		name: 'Local',
		className:
			'text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl size-full'
	})
	const btnRemote = document.getElementById('remote')
	if (!btnRemote) return document.createElement('div')
	const btnRemoteElement: HTMLButtonElement = createButton({
		name: 'Remote',
		className:
			'text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl size-full'
	})

	const btnTournament = document.getElementById('tournament')
	if (!btnTournament) return document.createElement('div')
	const btnTournamentElement: HTMLButtonElement = createButton({
		name: 'Tournament',
		className:
			'text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl size-full'
	})

	const btnFriends = document.getElementById('friends-requests')
	if (!btnFriends) return document.createElement('div')
	const btnFriendsElement: HTMLButtonElement = createButton({
		name: 'Friends',
		className:
			'text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl w-full'
	})

	const btnRequests = document.getElementById('friends-requests')
	if (!btnRequests) return document.createElement('div')
	const btnRequestsElement: HTMLButtonElement = createButton({
		name: 'Requests',
		className:
			'text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl w-full'
	})

	imgProfile.append(imgProfilePage)
	btnSettings.append(btnSettingsElement)
	btnLocal.append(btnLocalElement)
	btnRemote.append(btnRemoteElement)
	btnTournament.append(btnTournamentElement)
	btnFriends.append(btnFriendsElement)
	btnRequests.append(btnRequestsElement)

	return container
}
