import { createButton } from "../components/button.js"
import { createLink } from "../components/link.js"
import { createImg } from "../components/image.js"
import { createPopupElement, showPopup } from '../components/popUp.js';

export function renderHomePage(): void {
	const container = document.getElementById('content')
	if (!container)
		return
	container.innerHTML = /*html*/`
	<section class="pt-6">
		<h1 class="text-5xl font-bold text-center">Transcendence</h1>
		<div id="img-home"></div>
		<div id="btn-home" class="grid grid-cols-3 grid-rows-3 p-4 gap-5 size-fit mx-auto"></div>
	</section>
	`

	const imgHome = document.getElementById('img-home')
	if (!imgHome)
		return

	const imgHomePage: HTMLImageElement = createImg({
	src: '/images/pong.avif',
	alt: 'ping',
	className: 'flex-shrink-0 p-10'
	})

	const btnHome = document.getElementById('btn-home')
	if (!btnHome)
		return

	const imgPopUpSin: HTMLImageElement = createImg ({
		src: '/images/lrio.jpg',
		alt: 'lolo'
	})

		const imgPopUpSup: HTMLImageElement = createImg ({
		src: '/images/mjuffard.jpg',
		alt: 'lolo'
	})

	const btnSignIn: HTMLButtonElement = createButton({
		className: 'text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 p-4 rounded-md border border-gray-400 hover:bg-gray-400 shadow-xl col-start-1 col-end-2',
		name: 'Sign In',
		onClick: (ev: MouseEvent) => {
			showPopup(imgPopUpSin, {
				id: 'popup-overlay',
				className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50'
			})
		}
	})

	const btnSignUp: HTMLButtonElement = createButton({
		className: 'text-blue-700 text-xl hover:text-cyan-700 bg-gray-300  rounded-md border border-gray-400 hover:bg-gray-400 shadow-xl col-start-3',
		name: 'Sign Up',
		onClick: (ev: MouseEvent) => {
			showPopup(imgPopUpSup, {
				id: 'popup-overlay',
				className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50'
			})
		}
	})

	const logoGoogle: HTMLImageElement = createImg({
		src: '/images/l-ggl.webp',
		alt: 'logo-google',
		className: 'size-7 inline -ml-3 m-2'
	}) 

	const aOAuth: HTMLAnchorElement = createLink({
		className: 'p-2 text-blue-700 text-xl text-center self-center hover:text-cyan-700 bg-gray-300  rounded-md border border-gray-400 hover:bg-gray-400 shadow-xl col-span-3',
		href: 'https://www.google.com',
		img: logoGoogle,
		title: 'Continue with Google'
		})
		
	

	imgHome.append(imgHomePage)
	btnHome.append(btnSignIn)
	btnHome.append(btnSignUp)
	btnHome.append(aOAuth)
}