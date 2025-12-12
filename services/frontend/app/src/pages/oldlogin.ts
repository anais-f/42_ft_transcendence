import {
	handleGoogleLogin,
	handleLogin,
	handleRegister
} from '../events/loginPageHandlers.js'

export const LoginPage = (): string => {
	return /*html*/ `
<section class="grid grid-cols-4 gap-11">
	<div class="col-span-1 flex flex-col items-start">
		<h1 class="text-2xl py-4">SUBSCRIBE TO OUR NEWSPAPER</h1>
		<form id="register_form" data-form="register" class="flex flex-col gap-2">
			<input type="text" name="register_username" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="USERNAME" required>
			<input type="password" name="register_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
			<input type="password" name="register_conf_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="CONFIRM PASSWORD" required>
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
		<form id="login_form" data-form="login" class="flex flex-col gap-2">
		<input id="login_username" type="text" name="login_username" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="USERNAME" required>
		<input id="login_password" type="password" name="login_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
		<button id="login_btn" class="generic_btn mt-4" type="submit">Login</button>
		
		<!-- <button id="google_btn" type="button" class="generic_btn">Continue with Google</button> -->
		
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
			<button id="btn-google" data-action="login-google" class="generic_btn my-8">
				<img src="/assets/images/l-ggl.webp" alt="Google_logo" class="size-7 inline -ml-3 -mt-1">
				Continue with Google
			</button>
			<img src="/assets/images/screamer_girl.png" alt="screamer girl" class="w-full object-cover opacity-50 select-none">
	</div>
</section>
`
}

// UNE SEULE FONCTION pour gérer TOUS les événements de la page login
export function attachLoginEvents() {
	const content = document.getElementById('content')
	if (!content) return

	// Gestion des FORMULAIRES
	content.addEventListener('submit', async (e) => {
		const form = (e.target as HTMLElement).closest('form[data-form]')
		// data-form = le type dans le html avec son nom comme attribut
		// form c'est un element dans le html
		// closest permet de remonter l'arbre DOM pour trouver le formulaire parent le plus proche avec l'attribut data-form
		// e.target est l'élément qui a déclenché l'événement de soumissionle e.preventdefault ?

		if (!form) return

		// stoppe le comportement par défaut du formulaire (rechargement de la page)
		e.preventDefault()
		// Récupère la valeur de l'attribut data-form pour savoir quel formulaire a été soumis
		const formName = form.getAttribute('data-form')

		if (formName === 'register') await handleRegister(form as HTMLFormElement)

		if (formName === 'login') await handleLogin(form as HTMLFormElement)
	})

	// Gestion des CLICS (boutons)
	content.addEventListener('click', (e) => {
		const target = e.target as HTMLElement

		// Utilise closest() pour trouver le bouton même si on clique sur l'image dedans
		// cherche un élément parent avec l'attribut data-action
		const actionButton = target.closest('[data-action]')
		if (actionButton) {
			// Récupère la valeur de l'attribut data-action
			const action = actionButton.getAttribute('data-action')

			if (action === 'login-google') {
				handleGoogleLogin()
			}
		}
	})

	console.log('Login page events attached')
}
