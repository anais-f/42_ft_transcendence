export async function handleResizeCanvas() {
	const canvas = document.getElementById('pong') as HTMLCanvasElement
	if (!canvas) return

	const rect = canvas.parentElement?.getBoundingClientRect()
	if (rect) {
		canvas.width = rect.width
		canvas.height = rect.height
	}
}
