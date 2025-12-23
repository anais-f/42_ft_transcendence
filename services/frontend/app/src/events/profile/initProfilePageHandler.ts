import { fetchUserById } from '../../api/usersApi.js'
import { IPublicProfileUser } from '@ft_transcendence/common'
import { checkIsFriendApi } from '../../api/friends/getFriendsApi.js'
import { Button } from '../../components/Button.js'
import { currentUser } from '../../usecases/userStore.js'

/**
 * Render the user profile data into the DOM
 * @param user
 */
function renderProfile(user: IPublicProfileUser) {
	const avatarImg = document.getElementById(
		'profile-avatar'
	) as HTMLImageElement
	if (avatarImg) avatarImg.src = user.avatar

	const usernameElem = document.getElementById(
		'profile-username'
	) as HTMLInputElement
	if (usernameElem) usernameElem.textContent = user.username

	const statusColorElem = document.getElementById(
		'profile-status-color'
	) as HTMLInputElement
	const statusTextElem = document.getElementById(
		'profile-status-text'
	) as HTMLInputElement

	if (statusColorElem && statusTextElem) {
		if (user.status === 1) {
			statusColorElem.className = 'w-3 h-3 rounded-full bg-green-500'
			statusTextElem.textContent = 'Online'
		} else {
			statusColorElem.className = 'w-3 h-3 rounded-full bg-gray-500'
			statusTextElem.textContent = 'Offline'
		}
	}

	const lastSeenElem = document.getElementById(
		'profile-last-seen'
	) as HTMLInputElement
	if (lastSeenElem)
		lastSeenElem.textContent = new Date(user.last_connection).toLocaleString()
}

/**
 * Initialize the profile page by fetching user data and rendering it
 * @param userId - The user ID to fetch profile for
 */
export async function initAndRenderUserProfile(userId: number) {
	const responseUser = await fetchUserById(userId)
	if (responseUser.error || !responseUser.data) {
		console.error('User not found: ', responseUser.error)
		const username = document.getElementById('profile-username')
		if (username) username.textContent = 'Error loading profile'
		return
	}

	if (currentUser && currentUser.user_id === userId) {
		updateFriendButton('no_button')
		renderProfile(responseUser.data)
		return
	}

	const statusResponse = await checkIsFriendApi(userId)
	if (statusResponse.error) {
		console.error('Error checking friendship status: ', statusResponse.error)
		return
	}

	const status = statusResponse.data?.status ?? -1
	const buttonState =
		status === 1 ? 'friend' : status === 0 ? 'pending' : 'none'
	updateFriendButton(buttonState)
	renderProfile(responseUser.data)
}

/**
 * Update the friend button based on friendship status
 * @param status - The friendship status: 'none', 'pending', 'friend', or 'no_button'
 */
export function updateFriendButton(
	status: 'none' | 'pending' | 'friend' | 'no_button'
) {
	const buttonContainer = document.getElementById('friend-button-container')
	if (!buttonContainer) return

	if (status === 'no_button') {
		buttonContainer.innerHTML = ''
		return
	}

	if (status === 'friend') {
		buttonContainer.innerHTML = Button({
			id: 'remove_friend_btn',
			text: 'Remove Friend',
			type: 'button',
			action: 'remove-friend',
			additionalClasses: 'mt-4 !mb-0'
		})
	} else if (status === 'pending') {
		buttonContainer.innerHTML = Button({
			id: 'pending_friend_btn',
			text: 'Pending',
			type: 'button',
			action: '',
			additionalClasses: 'mt-4 !mb-0 opacity-50 cursor-not-allowed'
		})
	} else {
		buttonContainer.innerHTML = Button({
			id: 'add_friend_btn',
			text: 'Add Friend',
			type: 'button',
			action: 'add-friend',
			additionalClasses: 'mt-4 !mb-0'
		})
	}
}

