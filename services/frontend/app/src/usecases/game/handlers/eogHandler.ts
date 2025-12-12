export function eogHandler(data: unknown) {
	const { reason } = data as { reason: string }
	console.log('Game ended:', reason)
	window.navigate('/home')
}
