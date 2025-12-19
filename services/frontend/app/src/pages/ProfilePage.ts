import { Button } from '../components/Button.js'
import { StatBox } from '../components/game/StatBox.js'
import { LoremSection } from '../components/LoremIpsum.js'
import { GameHistoryRow } from '../components/game/HistoryRow.js'
import { currentUser } from '../usecases/userStore.js'
import { IPublicProfileUser } from '@ft_transcendence/common'

const userProfile: IPublicProfileUser = {
	id: 1,
	username: 'Mammoth',
	avatar: '/public/assets/images/avatar.png',
	status: 'Online',
	last_seen: '05/12/2025 12:32am'
}

const statusColor =
	userProfile.status === 'online' ? 'bg-green-500' : 'bg-gray-500'

const isFriend = false

export const ProfilePage = (): string => {
	// Récupérer l'ID depuis l'URL
	//   const urlParts = window.location.pathname.split('/')
	//   const userId = urlParts[2]  // /profile/:id → index 2

	// Utiliser l'ID pour charger les données du profil
	// const userProfile = await fetchUserProfile(userId)

	return /*html*/ `
  <section class="grid grid-cols-4 gap-10 h-full w-full">

    <div class="col-4-span-flex">
      <h1 class="title_bloc">PLAYER OF THE MONTH</h1>
      <img src="${userProfile.avatar}" alt="Avatar" class="avatar_style">
      <div class="w-full my-4">
        <h2 class="text-xl font-medium font-special pb-1">${userProfile.username}</h2>
        <p class="text-gray-500 flex items-center gap-2 pb-1">
            <span class="w-3 h-3 rounded-full ${statusColor}"></span>${userProfile.status}</p>
        <p class="font-medium">Last Seen : <span class="font-normal">${userProfile.last_seen}</span></p>
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
      <h1 class="title_bloc w-full text-center">GAME HISTORY</h1>
      <div id="div_history_table" class="w-[90%] mx-auto border-2 border-black flex-1 overflow-hidden flex flex-col">
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
