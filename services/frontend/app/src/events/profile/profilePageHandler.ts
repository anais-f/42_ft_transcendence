import {
	requestFriendApi,
	removeFriendApi
} from '../../api/friends/handleFriendsApi.js'
import { updateFriendButton } from './initProfilePageHandler.js'

/**
 * Handle adding a friend
 * @param userId - The user ID to add as friend
 */
export async function handleAddFriend(userId: number): Promise<void> {
	const response = await requestFriendApi(userId)
	if (response.error) {
		console.error('Error sending friend request: ', response.error)
		return
	}

	console.log('Friend request sent successfully')
	updateFriendButton('pending')
}

/**
 * Handle removing a friend
 * @param userId - The user ID to remove from friends
 */
export async function handleRemoveFriend(userId: number): Promise<void> {
	const response = await removeFriendApi(userId)
	if (response.error) {
		console.error('Error removing friend: ', response.error)
		return
	}

	console.log('Friend removed successfully')
	updateFriendButton('none')
}
