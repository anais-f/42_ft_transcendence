import { Modal } from '../../components/modals/Modal.js'
import { PlayerCard } from '../../components/tournament/PlayerCard.js'
import { currentUser } from '../../usecases/userStore.js'

export const NEXT_MATCH_MODAL_ID = 'next-match-modal'

export const NextConfigModal = (): string => {
	const content = /*html*/ `
	<div class="flex flex-row space-x-4 items-center">
		<div class="flex-[2] text-center">
		${PlayerCard({
			id: 'modal-own-card',
			name: currentUser?.username || 'YOU',
			avatarUrl: currentUser?.avatar || '/assets/images/loading.png'
		})}
		</div>
		<div class="flex-1">
			<div class="w-fit mx-auto text-center">
				<h1 class="text-xl font-bold">VS</h1>
				<pi id="btn-ready">Starting in 5</p>
			</div>
		</div>
		<div class="flex-[2] text-center">
			${PlayerCard({
				id: 'modal-opponent-card',
				name: 'OPPONENT',
				avatarUrl: '/assets/images/loading.png'
			})}
		</div>
	</div>
	`
	return Modal({
		id: NEXT_MATCH_MODAL_ID,
		title: 'Next Round',
		subtitle: 'GOOD LUCK',
		content: content
	})
}
