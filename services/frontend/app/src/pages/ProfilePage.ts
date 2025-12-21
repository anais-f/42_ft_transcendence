import { Button } from '../components/Button.js'
import { StatBox } from '../components/game/StatBox.js'
import { LoremSection } from '../components/LoremIpsum.js'
import { GameHistoryRow } from '../components/game/HistoryRow.js'
import { initProfilePage } from "../events/profilePageHandler.js";

export const ProfilePage = (): string => {
	// Valeurs par défaut (seront overridées par le fetch)
	const isFriend = false

	return /*html*/ `
  <section class="grid grid-cols-4 gap-16 h-full w-full">

    <div class="col-4-span-flex">
      <h1 class="title_bloc">PLAYER OF THE MONTH</h1>
      <img id="profile-avatar" src="/avatars/img_default.png" alt="Avatar" class="avatar_style">
      <div class="w-full my-4">
        <h2 id="profile-username" class="text-xl font-medium font-special pb-1">Loading...</h2>
        <p class="text-gray-500 flex items-center gap-2 pb-1">
            <span id="profile-status-color" class="w-3 h-3 rounded-full bg-gray-500"></span>
						<span id="profile-status-text">Offlne</span>
				</p>
        <p class="font-medium">Last Seen : <span id="profile-last-seen" class="font-normal">...</span></p>
      </div>
      ${LoremSection({
				title: 'Biography',
				variant: 'fill'
			})}
      ${
				isFriend
					? `
        ${Button({
					id: 'remove_friend_btn',
					text: 'Remove Friend',
					type: 'button',
					action: 'remove-friend',
					additionalClasses: 'mt-4 !mb-0'
				})}
        `
					: `
        ${Button({
					id: 'add_friend_btn',
					text: 'Add Friend',
					type: 'button',
					action: 'add-friend',
					additionalClasses: 'mt-4 !mb-0'
				})}
      `
			}
    </div>

    <div class="col-4-span-flex">
      ${LoremSection({
				variant: 'short'
			})}
      <div class=" w-full my-4">
        <h1 class="title_bloc mb-4">STATISTICS</h1>
        ${StatBox({ label: 'Games Played', value: stats.games_played, color: 'text-indigo-900' })}
        ${StatBox({ label: 'Wins', value: stats.wins, color: 'text-emerald-900' })}
        ${StatBox({ label: 'Losses', value: stats.losses, color: 'text-rose-900' })}
        ${StatBox({ label: 'Win Rate', value: stats.winRate, color: 'text-yellow-800' })}
      </div>
      ${LoremSection({
				variant: 'fill'
			})}
      <img src="/assets/images/cup.png" alt="Cup" class="img_style pb-0">
    </div>


    <div class="col-span-2 flex flex-col items-start min-h-0">
      <h1 class="title_bloc w-full">GAME HISTORY</h1>
      <div id="div_history_table" class="w-[100%] mx-auto border-2 border-black flex-1 overflow-hidden flex flex-col">
        <table id="history_table" class="w-full table-fixed border-collapse flex flex-col h-full">
            <thead class="flex w-full">
                <tr class="flex w-full">
                    <th class="table_header w-32">Date</th>
                    <th class="table_header w-24">Result</th>
                    <th class="table_header flex-1">Player 1</th>
                    <th class="table_header flex-1">Player 2</th>
                </tr>
            </thead>
            <tbody class="w-full overflow-y-auto flex-1">
                ${history.map((game) => GameHistoryRow(game)).join('')}
            </tbody>
        </table>
      </div>    
     

    </div>


  </section>
  `
}

let clickHandler: ((e: Event) => Promise<void>) | null = null
let submitHandler: ((e: Event) => Promise<void>) | null = null

export async function attachProfileEvents(): void {
	await initProfilePage()

	const content = document.getElementById('content')
	if (!content) return

	// Create and store the click handler
	clickHandler = async (e: Event) => {
		const target = e.target as HTMLElement
		const actionButton = target.closest('[data-action]')

		if (actionButton) {
			e.preventDefault()
			const action = actionButton.getAttribute('data-action')
			// if (action === 'add-friend') {
			// 	await handleSearchUser('add', currentUser!.id)
			// }
			// if (action === 'remove-friend') {
			// 	await handleSearchUser('remove', currentUser!.id)
			// }
		}
	}

	submitHandler = async (e: Event) => {
		const form = e.target as HTMLElement
		e.preventDefault()
		const formName = form.getAttribute('data-form')
		console.log('e submitted form:', form)
	}

	// Attach the handler
	content.addEventListener('click', clickHandler)
	content.addEventListener('submit', submitHandler)

	console.log('Profile page events attached')
}

export function detachProfileEvents(): void {
	const content = document.getElementById('content')
	if (!content) return

	if (submitHandler) {
		content.removeEventListener('submit', submitHandler)
		submitHandler = null
	}

	if (clickHandler) {
		content.removeEventListener('click', clickHandler)
		clickHandler = null
	}

	console.log('Profile page events detached')
}



// Mock data for statistics and history
const stats = {
	games_played: 256,
	wins: 198,
	losses: 58,
	winRate: 10
}

const history = [
	{
		date: '2025-05-01',
		player1: 'Mamth',
		score1: 21,
		score2: 15,
		player2: 'Tiger',
		result: 'Win'
	},
	{
		date: '2025-05-02',
		player1: 'Mamjth',
		score1: 18,
		score2: 21,
		player2: 'Eagutle',
		result: 'Loss'
	},
	{
		date: '2025-05-03',
		player1: 'Math',
		score1: 22,
		score2: 20,
		player2: 'Shark',
		result: 'Win'
	},
	{
		date: '2025-05-04',
		player1: 'Mammh',
		score1: 19,
		score2: 21,
		player2: 'Lion',
		result: 'Loss'
	},
	{
		date: '2025-05-05',
		player1: 'Mammoth',
		score1: 23,
		score2: 22,
		player2: 'Wolf',
		result: 'Win'
	},
	{
		date: '2025-05-03',
		player1: 'Math',
		score1: 22,
		score2: 20,
		player2: 'Shark',
		result: 'Win'
	},
	{
		date: '2025-05-05',
		player1: 'Mammoth',
		score1: 3,
		score2: 0,
		player2: 'Wolf',
		result: 'Win'
	}
]
