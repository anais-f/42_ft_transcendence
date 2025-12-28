/**
 * Modal component props interface
 * id: modal id for targeting
 * title: modal header title
 * content: modal body content (HTML string)
 */
interface ModalProps {
	id: string
	title: string
	content: string
}

export const Modal = (props: ModalProps): string => {
	const { id, title, content } = props

	// base classes CSS for the modal overlay
	const overlayClasses =
		'hidden overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full h-full bg-black/50'

	// base classes CSS for the modal container
	const containerClasses =
		'relative border-2 border-black bg-[#fffefc] shadow-[6px_6px_0_rgba(0,0,0,0.2)]'

	return /*html*/ `
	<div id="${id}" class="${overlayClasses}" data-action="close-modal-overlay">
		<div class="relative w-full max-w-md max-h-full">
			<div class="${containerClasses}">
				<div class="flex items-center justify-between p-4 border-b-2 border-black">
					<h3 class="text-xl font-semibold font-rye">${title}</h3>
					<button type="button" class="text-2xl hover:opacity-50" data-action="close-modal">&times;</button>
				</div>
				<div class="p-4">
					${content}
				</div>
			</div>
		</div>
	</div>
	`
}

export function showModal(id: string): void {
	const modal = document.getElementById(id)
	if (modal) {
		modal.classList.remove('hidden')
		modal.classList.add('flex')
	}
}

export function hideModal(id: string): void {
	const modal = document.getElementById(id)
	if (modal) {
		modal.classList.add('hidden')
		modal.classList.remove('flex')
	}
}
