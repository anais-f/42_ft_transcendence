import { createButton } from '../components/button.js'
import { createLink } from '../components/link.js'
import { createImg } from '../components/image.js'
import { createPopupElement, showPopup } from '../components/popUp.js'

const user = {
	username: 'UserName',
	wins: 42,
	losses: 27,
	lastLogin: '27-04-1994'
}

export function renderProfile(): void {
	const container = document.getElementById('content')
	if (!container)
		return
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
			<div class="grid grid-cols-3 grid-rows-3 gap-4">
				<span class="col-span-3"></span>
				<div id="local">
				</div>
				<a href="#game" class="col-start-3">
					<h2 class="text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl">Remote</h2>
				</a>
				<a href="#game" class="col-span-3">
					<h2 class="text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl">Tournament</h2>
				</a>
			</div>
		</section>
	</main>
	<section class="flex flex-col items-end justify-end gap-1">
		<a href="#friends" class="bg-gray-300 mx-3 px-3 rounded-md border border-gray-400  hover:bg-gray-400 shadow-xl">
			<button>
				<h2 class="text-blue-700">Friends</h2>
			</button>
		</a>
		<a href="#requests" class="bg-gray-300 mx-2 px-2 rounded-md border border-gray-400  hover:bg-gray-400 shadow-xl">
			<button>
				<h2 class="text-blue-700">Requests</h2>
			</button>
		</a>
	</section>
</div>
</section>
	`

	const imgProfile = document.getElementById('img-profile')
	if (!imgProfile)
		return

	const imgProfilePage: HTMLImageElement = createImg({
		src: '/images/acancel.jpg',
		alt: 'user_avatar',
		className: 'rounded-full w-3/4 aspect-square object-cover flex-shrink-0 border-4 border-gray-400 shadow-xl mx-auto justify-start mt-4',
		title: 'User Avatar'
	})

	const PopupSettings: HTMLImageElement = createImg({
		src: '/images/pong.avif',
		alt: 'settings_image',
	})

	const btnSettings = document.getElementById('btn-settings')
	if (!btnSettings)
		return
	const btnSettingsElement: HTMLButtonElement = createButton({
		name: 'Settings',
		className: 'bg-gray-300 px-3 py-1 rounded-md border border-gray-400 hover:bg-gray-400 shadow-xl',
		onClick: (ev: MouseEvent) => {
			showPopup(PopupSettings, {
				id: 'popup-overlay',
				className:
					'fixed inset-0 z-50 flex items-center justify-center bg-black/50'
			})
		}
	
	})

	const btnLocal = document.getElementById('local')
	if (!btnLocal)
		return
	const btnLocalElement: HTMLButtonElement = createButton({
		name: 'Remote',
		className: 'text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl p-2',
		})
	
	
	imgProfile.append(imgProfilePage)
	btnSettings.append(btnSettingsElement)
	btnLocal.appendChild(btnLocalElement)
}