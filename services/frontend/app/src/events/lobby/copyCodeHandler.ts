import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { ToastActionType } from '../../types/toast.js'

export function handleCopyCode(
	actionButton: HTMLElement,
	codeElementId: string,
	defaultText: string
) {
	const codeSpan = document.getElementById(codeElementId)
	if (codeSpan) {
		if (!navigator?.clipboard?.writeText) {
			notyf.open({
				type: ToastActionType.ERROR_ACTION,
				message: "Can't copy code"
			})
			return
		}

		navigator.clipboard.writeText(codeSpan.textContent || '')
		actionButton.textContent = 'Copied!'
		notyf.open({
			type: ToastActionType.SUCCESS_ACTION,
			message: 'Copied!'
		})
		setTimeout(() => {
			actionButton.textContent = defaultText
		}, 2000)
	}
}
