import {
	getFriendsListAPI,
	getPendingRequestsAPI
} from '../../api/friends/getFriendsApi.js'
import {
	acceptFriendAPI,
	rejectFriendAPI
} from '../../api/friends/handleFriendsApi.js'
import { FriendRequestItem } from '../../components/friends/FriendRequestItem.js'
import { FriendListItem } from '../../components/friends/FriendListItem.js'

export async function fetchAndRenderFriendsList(): Promise<void> {
	const listFriends = document.getElementById('friend_list')
	if (!listFriends) return

	const friendsResponse = await getFriendsListAPI()
	if (friendsResponse.error || !friendsResponse.data) {
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

export async function fetchAndRenderFriendRequests(): Promise<void> {
	const listRequests = document.getElementById('request_list')
	if (!listRequests) return

	const requestsResponse = await getPendingRequestsAPI()
	if (requestsResponse.error || !requestsResponse.data) {
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

export async function acceptFriendRequest(requestId: number): Promise<void> {
	const response = await acceptFriendAPI(requestId)
	if (response.error) {
		return
	}
	await fetchAndRenderFriendsList()
	await fetchAndRenderFriendRequests()
}

export async function declineFriendRequest(requestId: number): Promise<void> {
	const response = await rejectFriendAPI(requestId)
	if (response.error) {
		return
	}
	await fetchAndRenderFriendRequests()
}
