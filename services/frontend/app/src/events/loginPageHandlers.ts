import { loginAPI, registerAPI } from '../api/authApi.js'
import { verify2FALoginAPI } from '../api/twoFAApi.js'
import { notyfGlobal as notyf } from '../utils/notyf.js'
import { switchTo2FAForm } from '../pages/oldlogin.js'
import { validateUsername, validatePassword, handleAuthSuccess } from '../utils/validation.js'

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

	if (!password || !username) {
		notyf.open({ type: 'info', message: 'Please fill all fields' })
		return
	}

	if (password !== confPassword) {
		notyf.error("Passwords don't match")
		return
	}

	const usernameResult = validateUsername(username)
	if (!usernameResult.success) {
		notyf.error(usernameResult.error)
		return
	}

	const passwordResult = validatePassword(password)
	if (!passwordResult.success) {
		notyf.error(passwordResult.error)
		return
	}

	const { data, error, status } = await registerAPI(usernameResult.data, passwordResult.data)

	if (error) {
		switch (status) {
			case 400:
				notyf.error('Invalid username or password format')
				break
			case 409:
				notyf.error('Username already taken')
				break
			case 429:
				notyf.error('Too many registration attempts, please wait')
				break
			case 502:
				notyf.error('Registration failed - service error. Please try again.')
				break
			case 503:
				notyf.error('Service temporarily unavailable. Please try again later.')
				break
			case 0:
				notyf.error('Network error, check your connection')
				break
			default:
				notyf.error(error)
		}
		return
	}

	await handleAuthSuccess('Account created successfully!')
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

	if (!password || !username) {
		notyf.open({ type: 'info', message: 'Please fill all fields' })
		return
	}

	const usernameResult = validateUsername(username)
	if (!usernameResult.success) {
		notyf.error(usernameResult.error)
		return
	}

	const passwordResult = validatePassword(password)
	if (!passwordResult.success) {
		notyf.error(passwordResult.error)
		return
	}

	const { data, error, status } = await loginAPI(usernameResult.data, passwordResult.data)

	if (error) {
		switch (status) {
			case 400:
				notyf.error('Invalid username or password format')
				break
			case 401:
				notyf.error('Invalid username or password')
				break
			case 429:
				notyf.error('Too many login attempts, please wait')
				break
			case 502:
				notyf.error('Login failed - service error. Please try again.')
				break
			case 503:
				notyf.error('Service temporarily unavailable. Please try again later.')
				break
			case 0:
				notyf.error('Network error, check your connection')
				break
			default:
				notyf.error(error)
		}
		return
	}

	if (data.pre_2fa_required) {
		notyf.open({ type: 'info', message: 'Please enter your 2FA code' })
		switchTo2FAForm()
		return
	}

	await handleAuthSuccess('Login successful!')
}

/**
 * Handler for the 2FA form
 * @param form
 * @return void
 */
export async function handle2FASubmit(form: HTMLFormElement) {
	const formData = new FormData(form)
	const code = formData.get('2fa_code')

	if (!code || code.toString().length !== 6) {
		notyf.error('Please enter a valid 6-digit code')
		return
	}

	const { data, error, status } = await verify2FALoginAPI(code.toString())

	if (error) {
		switch (status) {
      case 400:
        notyf.error('Invalid code format')
        break
      case 401:
				notyf.error('Invalid or expired 2FA code')
				break
      case 429:
        notyf.error('Too many login attempts, please wait')
        break
      case 502:
        notyf.error('Login failed - service error. Please try again.')
        break
      case 503:
        notyf.error('Service temporarily unavailable. Please try again later.')
        break
			case 0:
				notyf.error('Network error, check your connection')
				break
			default:
				notyf.error(error)
		}

		const codeInput = document.getElementById('2fa_code') as HTMLInputElement
		if (codeInput) codeInput.value = ''
		return
	}

	await handleAuthSuccess('Login successful!')
}
