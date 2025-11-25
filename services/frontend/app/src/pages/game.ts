export function renderGame(): HTMLElement {
	const container = document.getElementById('content')
	if (!container) return document.createElement('div')

	container.classList.add(
		'flex',
		'items-center',
		'justify-center',
		'min-h-[85vh]'
	)

	const canvas = document.createElement('canvas')
	canvas.id = 'pong'
	canvas.width = 1000
	canvas.height = 600
	canvas.style.background = 'blue'
	canvas.style.display = 'block'
	canvas.style.margin = 'auto'
	canvas.className = 'items-center'

	container.innerHTML = ''
	container.append(canvas)
	return container
}
