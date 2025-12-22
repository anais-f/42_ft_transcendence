import {
	getFriendsListApi,
	getPendingRequestsApi
} from '../../api/friends/getFriendsApi.js'
import { FriendRequestItem } from '../../components/friends/FriendRequestItem.js'
import { FriendListItem } from '../../components/friends/FriendListItem.js'



export async function renderFriendsList(friends: any[]): void {
	const listFriends = document.getElementById('friends_list')
	if (!listFriends) return

	console.log('hello from rednerFriendsList', friends)
	if (friends.length === 0) {
		listFriends.innerHTML = '<li class="p-4 text-gray-500">No friends yet.</li>'
		return
	}

}
