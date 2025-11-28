import '../../style.css'
import { createButton } from '../components/button.js'
import { createLink } from '../components/link.js'
import { createImg } from '../components/image.js'
import { createForm } from '../components/form.js'
import { showPopup } from '../components/popUp.js'
import { user } from '../index.js'

export function renderHomePage(): HTMLElement {
	const container = document.getElementById('content')
	if (!container) return document.createElement('div')
	container.innerHTML = /*html*/ `
	<section class="pt-6">
		<h1 class="text-5xl font-bold text-center">Transcendence</h1>
		<div id="img-home"></div>
		<div id="btn-home" class="grid grid-cols-[1fr_0.1fr_1fr] grid-rows-3 p-4 gap-5 size-fit mx-auto"></div>
	</section>
	`

	const imgHome = document.getElementById('img-home')
	if (!imgHome) return document.createElement('div')

	const imgHomePage: HTMLImageElement = createImg({
		src: '/images/pong.avif',
		alt: 'ping',
		className: 'flex-shrink-0 p-10'
	})

	const btnHome = document.getElementById('btn-home')
	if (!btnHome) return document.createElement('div')

	const imgPopUpSup: HTMLImageElement = createImg({
		src: '/images/mjuffard.jpg',
		alt: 'mimi'
	})

	const formPopUpSignIn: HTMLFormElement = createForm({
		id: 'form-popup-signin',
		className: 'flex gap-4',
		label: ['Login', 'Password', 'Validate Password'],
		input: [
			{ id: 'login', type: 'text', name: 'login', required: true },
			{ id: 'password', type: 'password', name: 'password', required: true },
			{ id: 'validate-password', type: 'password', name: 'validate-password', required: true, separator: true }
		],
		button: {
			text: 'Sign In',
			type: 'submit',
			className: 'bg-green-500 border border-green-600 p-3',
		},
		onSubmit: async (data: FormData) => {
			const user = {
				login: data.get('login'),
				password: data.get('password'),
				validatePassword: data.get('validate-password')
			}
			if (user.password !== user.validatePassword) {
				console.error('Passwords do not match')
				return
			}
			console.log('Sign In:', user.login, user.password)
			try {
				const res = await fetch('/auth/api/register', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(user)
				})
			} catch (error) {
				console.error('Error signing in:', error)
			}
			user.login = ''
			user.password = ''
		}
	})

	const formPopUpSignUp: HTMLFormElement = createForm({
		id: 'form-popup-signup',
		className: 'flex gap-4',
		label: ['Login', 'Password', 'Validate Password'],
		input: [
			{ id: 'login', type: 'text', name: 'login', required: true, separator: true },
			{ id: 'password', type: 'password', name: 'password', required: true, separator: true },
		],
		button: {
			text: 'Sign Up',
			type: 'submit',
			className: 'bg-green-500 border border-green-600 p-3',
		},
		onSubmit: async (data: FormData) => {
			const user = {
				login: data.get('login'),
				password: data.get('password')
			}
			console.log('Sign Up:', user.login, user.password)
			try {
				const res = await fetch('/auth/api/register', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(user)
				})
			} catch (error) {
				console.error('Error signing up:', error)
			}
			user.login = ''
			user.password = ''
		}
	})


	const btnSignIn: HTMLButtonElement = createButton({
		className:
			'text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 p-4 rounded-md border border-gray-400 hover:bg-gray-400 shadow-xl col-start-1 col-end-2',
		name: 'Sign In',
		onClick: (ev: MouseEvent) => {
			showPopup(formPopUpSignIn)
		}
	})

	const btnSignUp: HTMLButtonElement = createButton({
		className:
			'text-blue-700 text-xl hover:text-cyan-700 bg-gray-300  rounded-md border border-gray-400 hover:bg-gray-400 shadow-xl col-start-3',
		name: 'Sign Up',
		onClick: (ev: MouseEvent) => {
			showPopup(formPopUpSignUp)
		}
	})

	const logoGoogle: HTMLImageElement = createImg({
		src: '/images/l-ggl.webp',
		alt: 'logo-google',
		className: 'size-7 inline -ml-3 m-2'
	})

	const aOAuth: HTMLAnchorElement = createLink({
		className:
			'p-2 text-blue-700 text-xl text-center self-center hover:text-cyan-700 bg-gray-300  rounded-md border border-gray-400 hover:bg-gray-400 shadow-xl col-span-3',
		href: 'https://www.google.com',
		img: logoGoogle,
		title: 'Continue with Google'
	})

	imgHome.append(imgHomePage)
	btnHome.append(btnSignIn)
	btnHome.append(btnSignUp)
	btnHome.append(aOAuth)
	return container
}


// const formPopUpSignIn: HTMLElement = document.getElementById('popup-overlay') ?? document.body
// 	formPopUpSignIn.innerHTML = /*html*/ `
// 		<label for="username">Username</label>
// 		<input type="text" id="username" name="username" required />
// 		<label for="password">Password</label>
// 		<input type="password" id="password" name="password" required />
// 		<button type="submit">Sign In</button>
// 	`