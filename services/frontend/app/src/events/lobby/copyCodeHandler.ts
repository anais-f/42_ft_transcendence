import { notyfGlobal as notyf } from '../../utils/notyf.js'

export function handleCopyCode(actionButton: HTMLElement) {
	const codeSpan = document.getElementById('lobby-code')
	if (codeSpan) {
		if (!navigator?.clipboard?.writeText) {
			notyf.error("Can't copy game code")
		}

		navigator.clipboard.writeText(codeSpan.textContent || '')
		actionButton.textContent = 'Copied!'
		notyf.success('Copied!')
		setTimeout(() => {
			actionButton.textContent = 'Copy Lobby Code'
		}, 2000)
	}
}
