import { fetchUserById } from '../../api/usersApi.js'
import { IPublicProfileUser } from '@ft_transcendence/common'
import { checkIsFriendApi } from '../../api/friends/getFriendsApi.js'
import { Button } from '../../components/Button.js'

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
 * based on the user ID in the URL.
 */
export async function initProfilePage() {
	const urlParts = window.location.pathname.split('/')
	const userId = urlParts[2]

	if (!userId) {
		console.error('No user ID found in URL')
		return
	}

	const responseUser = await fetchUserById(userId)
	if (responseUser.error || !responseUser.data) {
		console.error('User not found: ', responseUser.error)
		const username = document.getElementById('profile-username')
		if (username) username.textContent = 'Error loading profile'
		return
	}

	const isFriendResponse = await checkIsFriendApi(Number(userId))
	if (isFriendResponse.error) {
		console.error('Error checking friendship status: ', isFriendResponse.error)
		return
	}

	const isFriend = isFriendResponse.data?.isFriend || false
	updateFriendButton(isFriend)

	renderProfile(responseUser.data)
}

/**
 * Update the friend button based on friendship status
 * @param isFriend
 */
function updateFriendButton(isFriend: boolean) {
	const buttonContainer = document.getElementById('friend-button-container')
	if (!buttonContainer) return

	if (isFriend) {
		buttonContainer.innerHTML = Button({
			id: 'remove_friend_btn',
			text: 'Remove Friend',
			type: 'button',
			action: 'remove-friend',
			additionalClasses: 'mt-4 !mb-0'
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
