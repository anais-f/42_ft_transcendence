import { checkAuth } from '../api/authService'
import { setCurrentUser } from '../usecases/userStore'
import { CredentialResponse } from '../types/google-type.js'
import {
	loadGoogleScript,
	loginWithGoogleCredential
} from '../api/authService.js'

export const LoginPage = (): string => {
	return /*html*/ `
<section class="grid grid-cols-4 gap-11">
    <div class="col-span-1 flex flex-col items-start">
        <h1 class="text-2xl py-4">SUBSCRIBE TO OUR NEWSPAPER</h1>
        <form id="register_form" class="flex flex-col gap-2">
            <input id="register_username" type="text" name="register_username" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="USERNAME" required>
            <input id="register_password" type="password" name="register_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
            <input id="register_conf_password" type="password" name="register_conf_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="CONFIRM PASSWORD" required>
            <button id="register_btn" class="generic_btn mt-4" type="submit">Register</button>
        </form>
        <div class="news_paragraph">
            <h1 class="text-lg pt-4">Title</h1>
            <p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt.</p>
        </div>
    </div>

    <div class="col-span-1 flex flex-col items-start">
        <div class="news_paragraph">
            <p class="text-sm pt-6 pb-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat.</p>
        </div>
        <img src="/assets/images/mammoth.png" alt="mamouth" class="w-full object-cover opacity-50 select-none">

        <div class="news_paragraph">
            <h1 class="text-lg pt-4">Title</h1>
            <p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt.</p>
        </div>
    </div>

    <div class="col-span-1 flex flex-col items-start">
        <div class="news_paragraph">
            <p class="text-sm py-6">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat.</p>
        </div>
        <h1 class="text-2xl pt-4 pb-1">RESUME READING</h1>
        <form id="login_form" class="flex flex-col gap-2">
        <input id="login_username" type="text" name="login_username" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="USERNAME" required>
        <input id="login_password" type="password" name="login_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
        <button id="login_btn" class="generic_btn mt-4" type="submit">Login</button>

        <div id="google-btn-container" class="my-8 h-12 w-full flex justify-center"></div>

        <div class="news_paragraph">
            <h1 class="text-lg pt-4">Title</h1>
            <p class="text-sm pb-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. </p>
        </div>

    </div>
    <div class="col-span-1 flex flex-col items-start">
        <div class="news_paragraph">
            <h1 class="text-lg pt-6 pb-4">Title</h1>
            <p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Nam perferendis facilis asperiores ea qui voluptates dolor eveniet. Omnis voluptas et ut est porro soluta ut est. Voluptatem dolore vero in. A aut iste et unde autem ut deserunt quam. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Beatae qui et placeat.</p>
        </div>
            
            <img src="/assets/images/screamer_girl.png" alt="screamer girl" class="w-full object-cover opacity-50 select-none">
    </div>
</section>
`
}

// Store form events to be able to remove them later
let registerFormListener: ((e: SubmitEvent) => Promise<void>) | null = null
let loginFormListener: ((e: SubmitEvent) => Promise<void>) | null = null

export function bindRegisterForm() {
	const formReg = document.getElementById('register_form')
	if (!formReg) {
		console.log('Error: register form not found')
		return
	}

	// Remove old listener if exists
	if (registerFormListener) {
		formReg.removeEventListener('submit', registerFormListener)
	}

	// Create listener function
	registerFormListener = async (e: SubmitEvent) => {
		e.preventDefault()

		const formData = new FormData(formReg as HTMLFormElement)
		console.log(formData)
		console.log(formData.get('register_password'))
		const pw = formData.get('register_password')
		const us = formData.get('register_username')

		if (!pw) return

		if (pw !== formData.get('register_conf_password')) {
			console.log("Passwords don't match")
			return
		}

		if (pw.toString().length < 8) {
			console.log('Password too short')
			return
		}

		const user = {
			login: us,
			password: pw
		}

		try {
			const res = await fetch('/auth/api/register', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(user)
			})

			if (!res.ok) {
				const error = await res.json()
				console.error('Register failed:', res.status, error)
				return
			}

			// Après register réussi, vérifier l'auth et mettre à jour le store
			// puis naviguer avec skipAuth=true pour éviter un double appel
			const authResult = await checkAuth()
			setCurrentUser(authResult)
			// CORRECTION: Ajouter 'await' pour s'assurer que la navigation est terminée.
			await window.navigate('/', true)
		} catch (e) {
			console.error('Register error:', e)
		}
	}

	// Add the new listener
	formReg.addEventListener('submit', registerFormListener)
	console.log('Register form bound')
}

export function unbindRegisterForm() {
	const formReg = document.getElementById('register_form')
	if (!formReg || !registerFormListener) return

	// Remove listener
	formReg.removeEventListener('submit', registerFormListener)
	registerFormListener = null
	console.log('Register form unbound')
}

export function bindLoginForm() {
	// recupereration du formulaire de login
	const formLogin = document.getElementById('login_form')
	if (!formLogin) {
		console.log('Error: login form not found')
		return
	}

	// Remove old listener if exists
	if (loginFormListener) {
		formLogin.removeEventListener('submit', loginFormListener)
	}

	// creation du listener de login
	loginFormListener = async (e: SubmitEvent) => {
		e.preventDefault()

		const formData = new FormData(formLogin as HTMLFormElement)
		console.log(formData)
		const passwd = formData.get('login_password')
		const user = formData.get('login_username')

		if (!passwd || !user) return

		if (passwd.toString().length < 8) {
			console.log('Password too short')
			return
		}

		const credentials = {
			login: user,
			password: passwd
		}

		try {
			const res = await fetch('/auth/api/login', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(credentials)
			})

			if (!res.ok) {
				const error = await res.json()
				console.error('Login failed:', res.status, error)
				return
			}

			// Après login réussi, vérifier l'auth et mettre à jour le store
			// puis naviguer avec skipAuth=true pour éviter un double appel
			const authResult = await checkAuth()
			setCurrentUser(authResult)
			// CORRECTION: Ajouter 'await' pour s'assurer que la navigation est terminée.
			await window.navigate('/', true)
		} catch (e) {
			console.error('Login error:', e)
		}
	}

	// ajout du listener au formulaire de login
	formLogin.addEventListener('submit', loginFormListener)
	console.log('Login form bound')
}

export function unbindLoginForm() {
	const formLogin = document.getElementById('login_form')
	if (!formLogin || !loginFormListener) return

	// Remove listener
	formLogin.removeEventListener('submit', loginFormListener)
	loginFormListener = null
	console.log('Login form unbound')
}

export async function bindGoogleBtn() {
	// On cible le conteneur vide
	const btnContainer = document.getElementById('google-btn-container')
	if (!btnContainer) return

	try {
		// 1. On charge le script
		await loadGoogleScript()

		// 2. On initialise et on rend le bouton
		if (window.google) {
			// Configuration avec ton Client ID
			window.google.accounts.id.initialize({
				client_id: 'Push you ID here', // todoo make Env work
				callback: async (response: CredentialResponse) => {
					// C'est ici qu'on reçoit le Token (Credential)
					console.log('Google Credential received', response)

					try {
						// Envoi au back
						await loginWithGoogleCredential(response.credential)

						// Succès : mise à jour du store et redirection
						const authResult = await checkAuth()
						setCurrentUser(authResult)
						await window.navigate('/', true)
					} catch (err) {
						console.error('Google Login Error:', err)
						alert('Erreur de connexion Google')
					}
				}
			})

			// Affichage du bouton Google officiel dans la div
			window.google.accounts.id.renderButton(btnContainer, {
				theme: 'outline',
				size: 'large',
				text: 'continue_with',
				width: '300' // Tu peux ajuster la largeur
			})
			console.log('Google button rendered')
		}
	} catch (e) {
		console.error('Impossible de charger le script Google API', e)
	}
}

export function unbindGoogleBtn() {
	const btnContainer = document.getElementById('google-btn-container')
	// Nettoyage visuel si nécessaire (Google gère ses propres listeners internes)
	if (btnContainer) {
		btnContainer.innerHTML = ''
	}
	console.log('Google Auth unbound')
}
