import {
	WSMessageType,
	NotificationPayload
} from '@common/interfaces/websocketModels.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { FriendRequestItem } from '../../components/friends/FriendRequestItem.js'

export function handleSocialDispatcher(message: MessageEvent) {
	try {
		const msg = JSON.parse(message.data)
		console.log(msg)
		if (msg.type === WSMessageType.CONNECTION_ESTABLISHED) {
			console.log('Received connection established')
		} else if (msg.type === WSMessageType.FRIEND_REQUEST) {
			handleFriendRequest(msg as NotificationPayload)
		} else if (msg.type === WSMessageType.FRIEND_ACCEPT) {
			// Handle friend accep
		} else if (msg.type === WSMessageType.FRIEND_REMOVE) {
			// Handle friend remove
		} else if (msg.type === WSMessageType.FRIEND_REJECT) {
			// Handle friend reject
		} else if (msg.type === WSMessageType.USER_STATUS_CHANGE) {
			const data = msg.data
			updateFriendStatus(data.userId, data.status)
		} else console.warn('Unknown social message type:', msg.type)
	} catch (error) {
		console.error('Failed to parse social message:', error)
	}
}

function updateFriendStatus(userId: number, status: number) {
	const friendItemId = `friend_item_${userId}`
	const friendItem = document.getElementById(friendItemId)
	const statusCircle = document.getElementById(`status_circle_${userId}`)
	const statusText = document.getElementById(`status_text_${userId}`)

	if (!friendItem || !statusCircle || !statusText) {
		console.warn(`Friend item with ID ${friendItemId} not found.`)
		return
	}

	const isOnline = status === 1
	if (isOnline) {
		statusCircle.classList.remove('bg-gray-500')
		statusCircle.classList.add('bg-green-500')
		statusText.textContent = 'Online'
	} else {
		statusCircle.classList.remove('bg-green-500')
		statusCircle.classList.add('bg-gray-500')
		statusText.textContent = 'Offline'
	}

	console.log(
		`Updated status for friend ID ${userId} to ${isOnline ? 'Online' : 'Offline'}.`
	)
}
