import {
	getFriendsListApi,
	getPendingRequestsApi
} from '../../api/friends/getFriendsApi.js'
import { FriendRequestItem } from '../../components/friends/FriendRequestItem.js'
import { FriendListItem } from '../../components/friends/FriendListItem.js'

/**
 * Initialize the home page by clearing existing friend and request lists.
 * This function prepares the home page for fresh content loading.
 * @returns {Promise<void>} A promise that resolves when initialization is complete.
 */
export function initHomePage() {
	try {
		console.log('Initializing home page...')
		const friendsData = getFriendsListApi()
		if (friendsData.error) {
			console.error('Error fetching friends list:', friendsData.error)
		} else if (friendsData.data) {
			renderFriendsList(friendsData.data.friends)
		}
	} catch (error) {
		console.error('Network error while fetching friends list:', error)
	}
}

export function renderFriendsList(friends: any[]): void {
	const listFriends = document.getElementById('friends_list')
	if (!listFriends) return

	console.log('hello from rednerFriendsList', friends)
	if (friends.length === 0) {
		listFriends.innerHTML = '<li class="p-4 text-gray-500">No friends yet.</li>'
		return
	}

	listFriends.innerHTML = friends
		.map((friend) => FriendListItem(friend))
		.join('')
}
