import { loginAPI, registerAPI } from '../api/authApi.js'
import { verify2FALoginAPI } from '../api/twoFAApi.js'
import { notyfGlobal as notyf } from '../utils/notyf.js'
import { switchTo2FAForm } from '../pages/LoginPage.js'
import {
	validateUsername,
	validatePassword,
	handleAuthSuccess
} from '../usecases/userValidation.js'
import { ToastActionType } from '../types/toast.js'
import { jwtDecode } from 'jwt-decode'
import { IJwtPayload } from '@ft_transcendence/common'

export async function handleRegister(form: HTMLFormElement) {
	const formData = new FormData(form)
	const username = formData.get('register_login')
	const password = formData.get('register_password')
	const confPassword = formData.get('register_conf_password')

	if (!password || !username) {
		notyf.open({
			type: ToastActionType.INFO_ACTION,
			message: 'Please fill all fields'
		})
		return
	}

	if (password !== confPassword) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: "Passwords don't match"
		})
		return
	}

	const usernameResult = validateUsername(username)
	if (!usernameResult.success) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: usernameResult.error
		})
		return
	}

	const passwordResult = validatePassword(password)
	if (!passwordResult.success) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: passwordResult.error
		})
		return
	}

	const { data, error, status } = await registerAPI(
		usernameResult.data,
		passwordResult.data
	)

	if (error) {
		switch (status) {
			case 0:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: 'Network error, check your connection'
				})
				break
			default:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: error
				})
		}
		form.reset()
		return
	}

	if (data?.token) {
		try {
			const payload = jwtDecode<IJwtPayload>(data.token)
			if (payload.login) {
				sessionStorage.setItem('register_login', payload.login)
			}
		} catch (error) {}
	}

	await handleAuthSuccess('Account created successfully!')
}

export async function handleLogin(form: HTMLFormElement) {
	const formData = new FormData(form)
	const username = formData.get('login_login')
	const password = formData.get('login_password')

	if (!password || !username) {
		notyf.open({
			type: ToastActionType.INFO_ACTION,
			message: 'Please fill all fields'
		})
		return
	}

	const usernameResult = validateUsername(username)
	if (!usernameResult.success) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: usernameResult.error
		})
		return
	}

	const passwordResult = validatePassword(password)
	if (!passwordResult.success) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: passwordResult.error
		})
		return
	}

	const { data, error, status } = await loginAPI(
		usernameResult.data,
		passwordResult.data
	)

	if (error) {
		switch (status) {
			case 0:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: 'Network error, check your connection'
				})
				break
			default:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: error
				})
		}
		form.reset()
		return
	}

	if (data.pre_2fa_required) {
		notyf.open({
			type: ToastActionType.INFO_ACTION,
			message: 'Please enter your 2FA code'
		})
		switchTo2FAForm('login_form', '2fa_form')
		return
	}

	await handleAuthSuccess('Login successful!')
}

export async function handle2FASubmit(form: HTMLFormElement) {
	const formData = new FormData(form)
	const code = formData.get('2fa_code')

	if (!code || code.toString().length !== 6) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'Please enter a valid 6-digit code'
		})
		return
	}

	const { data, error, status } = await verify2FALoginAPI(code.toString())

	if (error) {
		switch (status) {
			case 0:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: 'Network error, check your connection'
				})
				break
			default:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: error
				})
		}

		const codeInput = document.getElementById('2fa_code') as HTMLInputElement
		if (codeInput) codeInput.value = ''
		return
	}

	await handleAuthSuccess('Login successful!')
}
