import {
	requestFriendAPI,
	removeFriendAPI
} from '../../api/friends/handleFriendsApi.js'
import { updateFriendButton } from './initProfilePageHandler.js'

export async function handleAddFriend(userId: number): Promise<void> {
	const response = await requestFriendAPI(userId)
	if (response.error) {
		return
	}

	updateFriendButton('pending')
}

export async function handleRemoveFriend(userId: number): Promise<void> {
	const response = await removeFriendAPI(userId)
	if (response.error) {
		return
	}

	updateFriendButton('none')
}
