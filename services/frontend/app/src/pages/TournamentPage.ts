// TODO : components for buttons and inputs
// TODO : component lorem ipsum

import { PlayerCard } from '../components/PlayerCard.js'
import { TournamentCell } from '../components/TournamentCell.js'

export const TournamentPage = (): string => {
	return /*html*/ `
  <section class="h-screen">
    <h1>Tournament Page</h1>
    <section class="grid grid-cols-[1fr_3fr] gap-10 h-full">
      <div class="col-span-1 flex flex-col items-center w-full min-w-0">
        <div class="pt-10 pb-5 w-full">
          <h1 class="text-2xl text-center w-full flex flex-wrap justify-center items-center gap-2">
            <span class="select-none truncate">TOURNAMENT CODE:</span>
            <span class="whitespace-nowrap">T-XXXXX</span>
          </h1>
        </div>
        <div class="flex flex-col items-center w-full pb-5">
          <button id="btn-copy" class="generic_btn mb-2 truncate">
            Copy Lobby Code
          </button>
        </div>

      </div>
      <div class="flex flex-col gap-10">
        <div class="grid grid-cols-4 gap-10">
          ${PlayerCard({ name: 'Player 1', id: 'player_card_1' })}
          ${PlayerCard({ name: 'Player 2', id: 'player_card_2' })}
          ${PlayerCard({ name: 'Player 3', id: 'player_card_3' })}
          ${PlayerCard({ name: 'Player 4', id: 'player_card_4' })}
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
