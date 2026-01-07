import { Button } from '../Button.js'
import { Modal } from './Modal.js'

export const REJOIN_TOURNAMENT_MODAL = 'rejoin-tournament-modal'

let tournamentCode: string | null = null
export const RejoinTournamentModal = (): string => {
	const displayCode = tournamentCode || 'UNKNOWN'

	const content = `
	<div class="space-y-4">
		<p class="text-center">
			You are already in tournament: <span id="modal-code" class="font-bold">${displayCode}</span>
		</p>
		<div class="flex flex-row space-x-4 items-center mt-4">
			<div class="flex-1 text-center">
			${Button({
				text: 'Rejoin Tournament',
				type: 'button',
				action: 'rejoin-tournament'
			})}
			</div>
			<div class="flex-1 text-center">
			${Button({
				text: 'Quit',
				type: 'button',
				action: 'quit-tournament'
			})}
			</div>
		</div>
	</div>
	`

	return Modal({
		id: REJOIN_TOURNAMENT_MODAL,
		title: 'Tournament In Progress',
		subtitle: 'You are already in a tournament',
		content: content
	})
}

export function updateModalTournamentCode(code: string) {
	const html = document.getElementById('modal-code') as HTMLElement
	if (html) {
		html.textContent = code
	}
}
