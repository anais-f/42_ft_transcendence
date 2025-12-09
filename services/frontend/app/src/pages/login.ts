export const LoginPage = (): string => {

	return /*html*/ `
<section class="grid grid-cols-4 gap-11">
	<div class="col-span-1 flex flex-col items-start">
		<h1 class="text-2xl py-4">SUBSCRIBE TO OUR NEWSPAPER</h1>
		<form id="register_form" onsubmit="(e) => {console.log('Submit', e)
		e.preventDefault()}" class="flex flex-col gap-2">
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
			<button id="btn-google" class="generic_btn my-8">
				<img src="/assets/images/l-ggl.webp" alt="Google_logo" class="size-7 inline -ml-3 -mt-1">
				Continue with Google
			</button>
			<img src="/assets/images/screamer_girl.png" alt="screamer girl" class="w-full object-cover opacity-50 select-none">
	</div>
</section>
`
}

let registerFormListener: ((e: SubmitEvent) => Promise<void>) | null = null

export function bindRegisterForm() {
	console.log('Bind called')
	const formReg = document.getElementById('register_form')
	if (!formReg)
		return console.log('Error no form found')
	console.log('founded')

	// Remove old listener if it exists
	if (registerFormListener) {
		formReg.removeEventListener('submit', registerFormListener)
	}

	// Create new listener function
	registerFormListener = async (e: SubmitEvent) => {
		e.preventDefault()
		console.log(e)
		console.log(e.target)
		if (!e.target)
			return
		const formData = new FormData(formReg as HTMLFormElement)
		console.log(formData)
		console.log(formData.get('register_password'))
		const pw = formData.get('register_password')
		const us = formData.get('register_username')
		if (!pw)
			return
		if (pw != formData.get('register_conf_password'))
			return console.log("passwords don't match")
		const pwS = pw.toString()
		if (pwS.length < 8)
			return (console.log('pw too short'))
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
			window.navigate('/')
		}
		catch (e) {
			console.log(e)
		}

	}

	// Add the new listener
	formReg.addEventListener('submit', registerFormListener)
}
