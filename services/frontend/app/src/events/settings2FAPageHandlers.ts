import { currentUser } from '../usecases/userStore.js'
import {
	verifyMyPasswordAPI,
	setup2FAAPI,
	verifySetup2FAAPI,
	disable2FAAPI
} from '../api/twoFAApi.js'
import { notyfGlobal as notyf } from '../utils/notyf.js'
import { syncCurrentUser } from '../utils/userValidation.js'

/**
 * Verify the current user's password using JWT
 * @param password - The password to verify
 * @returns true if password is valid, false otherwise
 */
async function verifyCurrentUserPassword(password: string): Promise<boolean> {
	const { error, status } = await verifyMyPasswordAPI(password)

	if (error) {
		switch (status) {
			case 0:
				notyf.error('Network error, check your connection')
				break
			default:
				notyf.error(error)
		}
		return
	}

	return true
}

/**
 * Generate the 2FA QR code and otpauth_url
 * Use POST /auth/api/2fa/setup
 */
async function handleGenerateQRCode() {
	if (!currentUser) {
		notyf.error('User not authenticated')
		return
	}

	const { data, error, status } = await setup2FAAPI()

	if (error) {
		switch (status) {
			case 0:
				notyf.error('Network error, check your connection')
				break
			default:
				notyf.error(error)
		}
		return
	}

	// Display the QR code and otpauth_url in the UI
	const qrContainer = document.getElementById('qr_code_container')
	const generateStep = document.getElementById('generate_qr_step')
	const verifyStep = document.getElementById('verify_2fa_step')

	if (qrContainer && generateStep && verifyStep) {
		// Insert QR code and URL into the container
		qrContainer.innerHTML = `
			<div class="flex flex-col gap-2 items-center w-full">
				<p class="text-sm">Scan this QR code with Google Authenticator:</p>
				<img src="${data.qr_base64}" alt="QR Code" class="w-64 h-64 border-2 border-black">
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

		// Hide the button step, show the verification step
		generateStep.style.display = 'none'
		verifyStep.style.display = 'block'
	}
}

/**
 * Enable the 2FA after verifying the code
 * 2-step verification: 1) Verify password 2) Verify 2FA code and enable
 * @param form
 * @returns Promise<void>
 */
async function handleEnable2FA(form: HTMLFormElement): Promise<void> {
	const formData = new FormData(form)
	const code = formData.get('code') as string
	const password = formData.get('password') as string

	if (!currentUser) {
		notyf.error('User not authenticated')
		return
	}

	// STEP 1: Verify password
	if (!(await verifyCurrentUserPassword(password))) {
		return
	}

	// STEP 2: Verify 2FA code and enable
	const { error, status } = await verifySetup2FAAPI(code)

	if (error) {
		switch (status) {
			case 0:
				notyf.error('Network error, check your connection')
				break
			default:
				notyf.error(error)
		}
		return
	}

	if (!(await syncCurrentUser('Failed to update 2FA user data'))) return

	notyf.success('Two-Factor Authentication enabled successfully!')
	window.location.reload()
}

/**
 * Disable the 2FA after verifying the code
 * 2-step verification: 1) Verify password 2) Disable 2FA with code
 * @param form
 * @returns Promise<void>
 */
async function handleDisable2FA(form: HTMLFormElement) {
	const formData = new FormData(form)
	const code = formData.get('code') as string
	const password = formData.get('password') as string

	if (!currentUser) {
		notyf.error('User not authenticated')
		return
	}

	// STEP 1: Verify password
	if (!(await verifyCurrentUserPassword(password))) {
		return
	}

	// STEP 2: Disable 2FA
	const { error, status } = await disable2FAAPI(code)

	if (error) {
		switch (status) {
			case 0:
				notyf.error('Network error, check your connection')
				break
			default:
				notyf.error(error)
		}
		return
	}

	if (!(await syncCurrentUser('Failed to update 2FA user data'))) return

	notyf.success('Two-Factor Authentication disabled successfully!')
	window.location.reload()
}
