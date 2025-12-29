/**
 * Modal component props interface
 * id: modal id for targeting
 * title: modal header title
 * titleClass: optional additional classes for the title
 * subtitle: optional subtitle displayed above the title
 * subtitleClass: optional additional classes for the subtitle
 * content: modal body content (HTML string)
 */
interface ModalProps {
	id: string
	title: string
	titleClass?: string
	subtitle?: string
	subtitleClass?: string
	content: string
}

export const Modal = (props: ModalProps): string => {
	const { id, title, titleClass, subtitle, subtitleClass, content } = props

	// base classes CSS for the modal overlay
	const overlayClasses =
		'hidden overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full h-full bg-black/50'

	// base classes CSS for the modal container with paper texture
	const containerClasses =
		'relative border-2 border-black bg-[#fffefc] shadow-[6px_6px_0_rgba(0,0,0,0.2)]'

	const subtitleBaseClasses =
		'text-[10px] tracking-[0.3em] uppercase text-black/50 font-special'
	const subtitleHtml = subtitle
		? `<span class="${subtitleBaseClasses} ${subtitleClass ?? ''}">${subtitle}</span>`
		: ''

	const titleBaseClasses = 'text-xl font-special uppercase tracking-wider px-4'

	return /*html*/ `
	<div id="${id}" class="${overlayClasses}" data-action="close-modal-overlay">
		<div class="relative w-full max-w-md max-h-full">
			<div class="${containerClasses}" style="background-image: var(--paper-texture);">
				<button type="button" class="absolute top-2 right-3 text-2xl hover:opacity-50 font-special" data-action="close-modal">&times;</button>
				<div class="flex flex-col items-center pt-4 pb-2 px-4 border-b border-black/30">
					${subtitleHtml}
					<div class="flex items-center justify-between w-full">
						<span class="flex-1 border-t border-black/30"></span>
						<h3 class="${titleBaseClasses} ${titleClass ?? ''}">${title}</h3>
						<span class="flex-1 border-t border-black/30"></span>
					</div>
				</div>
				<div class="p-4 font-special">
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
