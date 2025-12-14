import { checkAuth } from '../api/authService.js'
import { setCurrentUser } from '../usecases/userStore.js'

/**
 * Handler for the registration form
 * @param form
 * @return void
 */
export async function handleRegister(form: HTMLFormElement) {
	const formData = new FormData(form)
	const username = formData.get('register_username')
	const password = formData.get('register_password')
	const confPassword = formData.get('register_conf_password')

	if (!password || !username) return

	if (password !== confPassword) {
		console.log("Passwords don't match")
		return
	}

  //TODO : validation username and password schema before sending to server -> function to validate credentials


	if (password.toString().length < 8) {
    alert('Password must be at least 8 characters long')
		console.log('Password too short')
		return
	}

	const user = {
		login: username,
		password: password
	}

	try {
		const res = await fetch('/auth/api/register', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify(user)
		})

		if (!res.ok) {
      // TODO: improve error handling and messages + specific cases (username taken, weak password, etc)
			const error = await res.json()
      alert('Registration failed: ' + error.message)
			console.error('Register failed:', res.status, error)
			return
		}

    // TODO: an utilitary function to handle auth response and set user state
		const authResult = await checkAuth()
		setCurrentUser(authResult)
		await window.navigate('/', true)
	} catch (e) {
		console.error('Register error:', e)
	}
}

/**
 * Handler for the login form
 * @param form
 * @return void
 */
export async function handleLogin(form: HTMLFormElement) {
	const formData = new FormData(form)
	const username = formData.get('login_username')
	const password = formData.get('login_password')

	if (!password || !username) return

  //TODO : validation username and password schema before sending to server -> function to validate credentials

	if (password.toString().length < 8) {
		console.log('Password too short')
		return
	}

	const credentials = {
		login: username,
		password: password
	}

	try {
		const res = await fetch('/auth/api/login', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify(credentials)
		})

		if (!res.ok) {
      // TODO: improve error handling and messages + specific cases
			const error = await res.json()
      alert(`An error occurred. Please try again.`)
			console.error('Login failed:', res.status, error)
			return
		}

		const authResult = await checkAuth()
		setCurrentUser(authResult)
		await window.navigate('/', true)
	} catch (e) {
		console.error('Login error:', e)
	}
}
