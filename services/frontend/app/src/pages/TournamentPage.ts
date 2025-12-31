import {
	PlayerCard,
	updatePlayerCard
} from '../components/tournament/PlayerCard.js'
import { TournamentCell } from '../components/game/TournamentCell.js'
import { Button } from '../components/Button.js'
import { handleCopyCode } from '../events/lobby/copyCodeHandler.js'
import { routeParams } from '../router/Router.js'
import { gameStore } from '../usecases/gameStore.js'
import { tournamentStore } from '../usecases/tournamentStore.js'
import { currentUser } from '../usecases/userStore.js'
import { updatePlayerCard } from '../components/tournament/PlayerCard.js'

export const TournamentPage = (): string => {
	const code = tournamentStore.tournamentCode || 'T-XXXXX'

	return /*html*/ `
  <section class="h-screen">
    <h1>Tournament Page</h1>
    <section class="grid grid-cols-[1fr_3fr] gap-10 h-full">
      <div class="col-span-1 flex flex-col items-center w-full min-w-0">
        <div class="pt-10 pb-5 w-full">
          <h1 class="text-2xl text-center w-full flex flex-wrap justify-center items-center gap-2">
            <span class="select-none truncate">TOURNAMENT CODE:</span>
            <span id="tournament-code" class="whitespace-nowrap">${code}</span>
          </h1>
        </div>
        <div class="flex flex-col items-center w-full pb-5">
        ${Button({
					id: 'btn-copy',
					text: 'Copy Tournament Code',
					type: 'button',
					action: 'copy-tournament-code'
				})}
        </div>

      </div>
      <div class="flex flex-col gap-10">
        <div class="grid grid-cols-4 gap-10">
          ${PlayerCard({ name: 'Waiting...', id: 'player_card_0' })}
          ${PlayerCard({ name: 'Waiting...', id: 'player_card_1' })}
          ${PlayerCard({ name: 'Waiting...', id: 'player_card_2' })}
          ${PlayerCard({ name: 'Waiting...', id: 'player_card_3' })}
        </div>
        <div class="flex-1">
          <div class="w-full grid grid-cols-3 grid-rows-9">
            ${TournamentCell({ id: 'match1-p1', name: 'PLAYER 1', score: 5, additionalClasses: 'border-b-2' })}
            <div></div>
            <div></div>
            <div class="border-r-2 border-black"></div>
            ${TournamentCell({ id: 'semi1-winner', name: 'PLAYER 1', score: 5, additionalClasses: 'border-b-2' })}
            <div></div>
            ${TournamentCell({ id: 'match1-p2', name: 'PLAYER 3', score: 2, additionalClasses: 'border-b-2 border-r-2' })}
            <div class="border-r-2 border-black"></div>
            <div></div>
            <div></div>
            <div class="border-r-2 border-black"></div>
            <div></div>
            <div></div>
            <div class="border-r-2 border-black"></div>
            ${TournamentCell({ id: 'final-winner', name: 'PLAYER 1', additionalClasses: 'border-b-2' })}
            <div></div>
            <div class="border-r-2 border-black"></div>
            <div></div>
            ${TournamentCell({ id: 'match2-p1', name: 'PLAYER 2', score: 5, additionalClasses: 'border-b-2' })}
            <div class="border-r-2 border-black"></div>
            <div></div>
            <div class="border-r-2 border-black"></div>
            ${TournamentCell({ id: 'match2-p2', name: 'PLAYER 4', score: 5, additionalClasses: 'border-b-2 border-r-2' })}
            <div></div>
            ${TournamentCell({ id: 'semi2-winner', name: 'PLAYER 4', score: 5, additionalClasses: 'border-b-2 border-r-2' })}
          </div>
        </div>  
      </div>
    </section>
  </section>
`
}

let clickHandler: ((e: Event) => void) | null = null

function initTournamentData() {
	const name = currentUser?.username ?? 'you'
	const avatar = currentUser?.avatar ?? '/avatars/img_default.png'

	updatePlayerCard('player_card_0', name, avatar)
}

export function attachTournamentEvents() {
	const content = document.getElementById('content')
	if (!content) return

	initTournamentData()

	clickHandler ??= (e: Event) => {
		const target = e.target as HTMLElement
		const actionButton = target.closest('[data-action]')

		if (actionButton) {
			const action = actionButton.getAttribute('data-action')

			if (action === 'copy-tournament-code') {
				handleCopyCode(
					actionButton as HTMLElement,
					'tournament-code',
					'Copy Tournament Code'
				)
			}
		}
	}

	content.addEventListener('click', clickHandler)
}

export function detachTournamentEvents() {
	const content = document.getElementById('content')
	if (!content) return

	if (clickHandler) {
		content.removeEventListener('click', clickHandler)
		clickHandler = null
	}
}
