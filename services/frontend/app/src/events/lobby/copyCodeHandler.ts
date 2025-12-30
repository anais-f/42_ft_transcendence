import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { ToastActionType } from '../../types/toast.js'

export function handleCopyCode(actionButton: HTMLElement) {
	const codeSpan = document.getElementById('lobby-code')
	if (codeSpan) {
		if (!navigator?.clipboard?.writeText) {
			notyf.open({
				type: ToastActionType.ERROR_ACTION,
				message: "Can't copy game code"
			})
		}

		navigator.clipboard.writeText(codeSpan.textContent || '')
		actionButton.textContent = 'Copied!'
		notyf.open({
			type: ToastActionType.SUCCESS_ACTION,
			message: 'Copied!'
		})
		setTimeout(() => {
			actionButton.textContent = 'Copy Lobby Code'
		}, 2000)
	}
}
