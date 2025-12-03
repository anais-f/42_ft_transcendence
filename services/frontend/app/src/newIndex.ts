import '../style.css'
import { showPopup } from './components/popUp.js';
import { LoginPage } from './pages/old_pages/old_login.js'

document.addEventListener('DOMContentLoaded', () => {
	const contentDiv = document.getElementById('content')
	if (!contentDiv) {
		console.error('Missing #content in index.html')
		return
	}
	const content: HTMLElement = contentDiv
	content.innerHTML = LoginPage()

	const btnRegister = document.getElementById('btn-signup')
	if (btnRegister) {
		console.log('btnRegister found')
		btnRegister.addEventListener('click', (ev: MouseEvent) => {
			ev.preventDefault()
			let form: HTMLElement = document.getElementById('popup-overlay') ?? document.createElement('div')
			form.innerHTML = /*html*/ `
					<form id="form-popup-signin" class="flex flex-col gap-4">
						<label for="login">Login</label>
						<input id="login" type="text" name="login" class="border border-gray-400 rounded-sm" required>
						<label for="password">Password</label>
						<input id="password" type="password" name="password" class="border border-gray-400 rounded-sm" required>
						<label for="validate_password">Validate Password</label>
						<input id="validate_password" type="password" name="validate_password" class="border border-gray-400 rounded-sm" required>
						<button type="submit" class="submission_btn">Sign In</button>
					</form>
					`
			showPopup(form)
		})
	}

	const btnLogin = document.getElementById('btn-signin')
	if (btnLogin) {
	console.log('btnLogin found')
	btnLogin.addEventListener('click', (ev: MouseEvent) => {
		ev.preventDefault()
		let form: HTMLElement = document.getElementById('popup-overlay') ?? document.createElement('div')
		form.innerHTML = /*html*/ `
				<form id="form-popup-signin" class="flex flex-col gap-4">
					<label for="login">Login</label>
					<input id="login" type="text" name="login" class="border border-gray-400 rounded-sm" required>
					<label for="password">Password</label>
					<input id="password" type="password" name="password" class="border border-gray-400 rounded-sm" required>
					<button type="submit" class="submission_btn">Sign Up</button>
				</form>
			</div>`
		showPopup(form)
	})
}

});