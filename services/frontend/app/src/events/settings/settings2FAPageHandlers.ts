import { currentUser } from '../../usecases/userStore.js'
import {
	verifyMyPasswordAPI,
	setup2FAAPI,
	verifySetup2FAAPI,
	disable2FAAPI
} from '../../api/twoFAApi.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { syncCurrentUser } from '../../usecases/userValidation.js'
import { ToastActionType } from '../../types/toast.js'

export async function verifyCurrentUserPassword(
	password: string
): Promise<boolean> {
	const { error, status } = await verifyMyPasswordAPI(password)

	if (error) {
		switch (status) {
			case 0:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: 'Network error, check your connection password'
				})
				break
			default:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: error
				})
		}
		return false
	}

	return true
}

export async function handleGenerateQRCode() {
	if (!currentUser) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'User not authenticated'
		})
		return
	}

	const { data, error, status } = await setup2FAAPI()

	if (error) {
		switch (status) {
			case 0:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: 'Network error, check your connection qrcode'
				})
				break
			default:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: error
				})
		}
		return
	}

	const generateBtn = document.getElementById('generate_qr_btn')
	const verifyStep = document.getElementById('verify_2fa_step')
	const qrContainer = document.getElementById('qr_code_container')

	if (generateBtn && qrContainer && verifyStep) {
		qrContainer.innerHTML = `
			<div class="flex flex-col gap-2 items-center w-full">
				<p class="text-sm">Scan this QR code with Google Authenticator:</p>
				<img src="${data.qr_base64}" alt="QR Code" class="w-64 aspect-square border-2 border-black">
				<p class="text-xs mt-2">Or copy this URL:</p>
				<input
					type="text"
					value="${data.otpauth_url}"
					readonly
					class="text-xs px-2 py-1 border border-black w-full font-mono"
					onclick="this.select()"
				>
				<p class="text-xs opacity-50 mt-2">Expires in 5 minutes</p>
			</div>
		`

		generateBtn.classList.add('hidden')
		verifyStep.classList.remove('hidden')
	}
}

export async function handleEnable2FA(form: HTMLFormElement): Promise<void> {
	const formData = new FormData(form)
	const code = formData.get('code') as string
	const password = formData.get('password') as string

	if (!currentUser) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'User not authenticated'
		})
		return
	}

	if (
		!currentUser?.is_google_user &&
		!(await verifyCurrentUserPassword(password))
	) {
		form.reset()
		return
	}

	const { error, status } = await verifySetup2FAAPI(code)

	if (error) {
		switch (status) {
			case 0:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: 'Network error, check your connection enable'
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

	if (!(await syncCurrentUser('Failed to update 2FA user data'))) {
		form.reset()
		return
	}

	window.navigate('/settings')
	notyf.open({
		type: ToastActionType.SUCCESS_ACTION,
		message: 'Two-Factor Authentication enabled successfully!'
	})
}

export async function handleDisable2FA(form: HTMLFormElement) {
	const formData = new FormData(form)
	const code = formData.get('code') as string
	const password = formData.get('password') as string

	if (!currentUser) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'User not authenticated'
		})
		return
	}

	if (
		!currentUser?.is_google_user &&
		!(await verifyCurrentUserPassword(password))
	) {
		form.reset()
		return
	}

	const { error, status } = await disable2FAAPI(code)

	if (error) {
		switch (status) {
			case 0:
				notyf.open({
					type: ToastActionType.ERROR_ACTION,
					message: 'Network error, check your connection disable'
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

	if (!(await syncCurrentUser('Failed to update 2FA user data'))) {
		form.reset()
		return
	}

	window.navigate('/settings')
	notyf.open({
		type: ToastActionType.SUCCESS_ACTION,
		message: 'Two-Factor Authentication disable successfully!'
	})
}
