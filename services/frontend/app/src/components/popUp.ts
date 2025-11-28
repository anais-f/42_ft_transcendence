interface interfaceOverlay {
	id: string
	className: string
	onClick?: (ev: MouseEvent) => void
}

// id = 'popup-overlay',
// className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50'

export function createPopupElement(overlayDef: interfaceOverlay): HTMLElement {
	const overlay: HTMLElement = document.createElement('div')
	overlay.id = overlayDef.id
	overlay.className = overlayDef.className

	overlay.addEventListener('click', (ev) => {
		if (ev.target === overlay && typeof overlayDef.onClick === 'function') {
			overlayDef.onClick(ev)
		}
	})

	return overlay
}

let __escHandler: ((ev: KeyboardEvent) => void) | null = null

export function showPopup(contentNode: Node) {
	if (document.getElementById('popup-overlay')) return
	const overlay = createPopupElement({
		id: 'popup-overlay',
		className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50',
		onClick: () => hidePopup()
	})

	const panel = document.createElement('div')
	panel.className =
		'bg-white p-4 rounded shadow max-w-[90%] max-h-[90%] overflow-auto'
	panel.append(contentNode)
	overlay.append(panel)

	document.body.append(overlay)
	document.body.style.overflow = 'hidden'

	__escHandler = (ev) => {
		if (ev.key === 'Escape') hidePopup()
	}
	document.addEventListener('keydown', __escHandler)
}

export function hidePopup() {
	const overlay = document.getElementById('popup-overlay')
	if (!overlay) return
	if (__escHandler) document.removeEventListener('keydown', __escHandler)
	overlay.remove()
	document.body.style.overflow = ''
	__escHandler = null
}
