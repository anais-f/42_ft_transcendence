export function startingInHandler(data: unknown) {
	const { seconds } = data as { seconds: number }

	const readyBtn = document.getElementById('btn-ready')
	if (readyBtn) {
		readyBtn.textContent = `Starting in ${seconds}...`
		readyBtn.setAttribute('disabled', 'true')
	}
}
