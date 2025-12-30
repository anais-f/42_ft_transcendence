import { LoremSection } from '../components/LoremIpsum.js'
import { StatusCircle } from '../components/friends/StatusCircle.js'
import { initAndRenderUserProfile } from '../events/profile/initProfilePageHandler.js'
import {
	handleAddFriend,
	handleRemoveFriend
} from '../events/profile/profilePageHandler.js'
import {
	fetchAndRenderStats,
	fetchAndRenderMatchHistory
} from '../events/profile/initStatsHandler.js'
import { userIdFromUrl } from '../usecases/urlUtils.js'

export const ProfilePage = (): string => {
	return /*html*/ `
  <section class="grid grid-cols-4 gap-16 h-full w-full">

    <div class="col-4-span-flex">
      <h1 class="title_bloc">PLAYER OF THE MONTH</h1>
      <img id="profile-avatar" src="/avatars/img_default.png" alt="Avatar" class="avatar_style">
      <div class="w-full my-4">
        <h2 id="profile-username" class="text-xl font-medium font-special pb-1">Loading...</h2>
        <p class="text-gray-500 flex items-center gap-2 pb-1">
            ${StatusCircle({ isOnline: false, id: 'profile-status-circle', additionalClasses: 'ml-1' })}
			<span id="profile-status-text">Offline</span>
		</p>
        <p class="font-medium">Last Seen : <span id="profile-last-seen" class="font-normal">...</span></p>
      </div>
      ${LoremSection({
				title: 'Biography',
				variant: 'fill'
			})}
      <div id="friend-button-container" class="w-full">                                                                                 
  		</div> 
    </div>

    <div class="col-4-span-flex">
      ${LoremSection({
				variant: 'short'
			})}
      <div class="w-full my-4">
        <h1 class="title_bloc mb-4">STATISTICS</h1>
        <div id="stats-boxes">
        </div>
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
            <tbody id="match-history" class="w-full overflow-y-auto flex-1">
            </tbody>
        </table>
      </div>    
    </div>

  </section>
  `
}

let clickHandler: ((e: Event) => Promise<void>) | null = null

async function initProfilePage(userId: number): Promise<void> {
	await initAndRenderUserProfile(userId)
	await fetchAndRenderStats(userId)
	await fetchAndRenderMatchHistory(userId)
}

export async function attachProfileEvents(): Promise<void> {
	const userId = await userIdFromUrl()
	if (userId === null) return

	await initProfilePage(userId)

	const content = document.getElementById('content')
	if (!content) return

	clickHandler ??= async (e: Event) => {
		const target = e.target as HTMLElement
		const actionButton = target.closest('[data-action]')

		if (actionButton) {
			e.preventDefault()
			const action = actionButton.getAttribute('data-action')
			if (action === 'add-friend') await handleAddFriend(userId)
			if (action === 'remove-friend') await handleRemoveFriend(userId)
			if (action === 'navigate-profile') {
				const id = actionButton.getAttribute('data-id')
				if (id) window.navigate(`/profile/${id}`)
			}
		}
	}

	content.addEventListener('click', clickHandler)

	console.log('Profile page events attached')
}

/**
 * Detach event listeners for the profile page.
 * Removes the click event handler from the content element.
 * Logs detachment status to the console.
 * @returns {void}
 */
export function detachProfileEvents(): void {
	const content = document.getElementById('content')
	if (!content) return

	if (clickHandler) {
		content.removeEventListener('click', clickHandler)
		clickHandler = null
	}

	console.log('Profile page events detached')
}
