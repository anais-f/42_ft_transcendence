export function handleCopyCode(actionButton: HTMLElement) {
	const codeSpan = document.getElementById('lobby-code')
	if (codeSpan) {
		navigator.clipboard.writeText(codeSpan.textContent || '')
		actionButton.textContent = 'Copied!'
		setTimeout(() => {
			actionButton.textContent = 'Copy Lobby Code'
		}, 2000)
	}
}
