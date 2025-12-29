import {
	getFriendsListApi,
	getPendingRequestsApi
} from '../../api/friends/getFriendsApi.js'
import {
	acceptFriendApi,
	rejectFriendApi
} from '../../api/friends/handleFriendsApi.js'
import { FriendRequestItem } from '../../components/friends/FriendRequestItem.js'
import { FriendListItem } from '../../components/friends/FriendListItem.js'

/**
 * Fetches the friends list and renders it into the friends list container.
 */
export async function fetchAndRenderFriendsList(): Promise<void> {
	const listFriends = document.getElementById('friend_list')
	if (!listFriends) return

	const friendsResponse = await getFriendsListApi()
	if (friendsResponse.error || !friendsResponse.data) {
		console.error('Failed to fetch friends list:', friendsResponse.error)
		return
	}

	const friends = friendsResponse.data.friends

	if (friends.length === 0) {
		listFriends.innerHTML = `<li class="flex items-center justify-center h-full p-4 text-gray-500 italic font-special text-center select-none">No friends added yet.</li>`
		return
	}

	const rowItems = friends.map((friend: any) =>
		FriendListItem({
			id: friend.user_id,
			username: friend.username,
			avatar: friend.avatar,
			status: friend.status
		})
	)

	listFriends.innerHTML = rowItems.join('')
}

/**
 * Fetches the pending friend requests and renders them into the requests list container.
 */
export async function fetchAndRenderFriendRequests(): Promise<void> {
	const listRequests = document.getElementById('request_list')
	if (!listRequests) return

	const requestsResponse = await getPendingRequestsApi()
	if (requestsResponse.error || !requestsResponse.data) {
		console.error('Failed to fetch friend requests:', requestsResponse.error)
		return
	}

	const requests = requestsResponse.data.pendingFriends

	if (requests.length === 0) {
		listRequests.innerHTML = `<li class="flex items-center justify-center h-full p-4 text-gray-500 italic font-special text-center select-none">No pending requests.</li>`
		return
	}

	const rowItems = requests.map((request: any) =>
		FriendRequestItem({
			id: request.user_id,
			username: request.username,
			avatar: request.avatar
		})
	)

	listRequests.innerHTML = rowItems.join('')
}

/**
 * Accepts a friend request and updates the friends and requests lists.
 * @param requestId
 */
export async function acceptFriendRequest(requestId: number): Promise<void> {
	const response = await acceptFriendApi(requestId)
	if (response.error) {
		console.error('Failed to accept friend request:', response.error)
		return
	}
	await fetchAndRenderFriendsList()
	await fetchAndRenderFriendRequests()
}

/**
 * Declines a friend request and updates the requests list.
 * @param requestId
 */
export async function declineFriendRequest(requestId: number): Promise<void> {
	const response = await rejectFriendApi(requestId)
	if (response.error) {
		console.error('Failed to decline friend request:', response.error)
		return
	}
	await fetchAndRenderFriendRequests()
}
