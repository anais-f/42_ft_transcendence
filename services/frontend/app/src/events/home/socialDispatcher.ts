import {
	WSMessageType,
	NotificationPayload
} from '@common/interfaces/websocketModels.js'
import { notyfFriends as notyf } from '../../utils/notyf.js'
import { ToastActionType } from '../../types/toast.js'
import {
	fetchAndRenderFriendRequests,
	fetchAndRenderFriendsList
} from './friendsHandler.js'

/**
 * Handles incoming WebSocket messages related to social features
 * @param message - The WebSocket message event
 */
export async function handleSocialDispatcher(message: MessageEvent) {
	try {
		const msg = JSON.parse(message.data)
		if (msg.type === WSMessageType.CONNECTION_ESTABLISHED) {
			// Connection established
		} else if (msg.type === WSMessageType.FRIEND_REQUEST) {
			await handleFriendRequest(msg as NotificationPayload)
		} else if (msg.type === WSMessageType.FRIEND_ACCEPT) {
			await handleFriendNotification(
				msg as NotificationPayload,
				ToastActionType.FRIEND_ACCEPT,
				true
			)
		} else if (msg.type === WSMessageType.FRIEND_REMOVE) {
			await handleFriendNotification(
				msg as NotificationPayload,
				ToastActionType.FRIEND_REMOVE,
				true
			)
		} else if (msg.type === WSMessageType.FRIEND_REJECT) {
			await handleFriendNotification(
				msg as NotificationPayload,
				ToastActionType.FRIEND_REJECT,
				false
			)
		} else if (msg.type === WSMessageType.USER_STATUS_CHANGE) {
			const data = msg.data
			updateFriendStatus(data.userId, data.status)
		} else console.warn('Unknown social message type:', msg.type)
	} catch (error) {
		console.error('Failed to parse social message:', error)
	}
}

/**
 * Updates the online status of a friend in the friends list UI
 * @param userId - The ID of the user whose status has changed
 * @param status - The new status (1 for online, 0 for offline)
 */
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
}

/**
 * Handles incoming friend requests
 * Displays a notification and refreshes the friend requests list
 * @param payload
 */
async function handleFriendRequest(payload: NotificationPayload) {
	const fromUsername = payload.data.from.username
	const fromUserId = payload.data.from.userId
	const message = payload.data.message

	notyf.open({
		type: ToastActionType.FRIEND_REQUEST,
		message: message
	})

	await fetchAndRenderFriendRequests()
}

/**
 * Handles friend notifications (accept, remove, reject)
 * Displays a notification and optionally refreshes the friend list
 * @param payload
 * @param notifType
 * @param shouldRefreshFriendList
 */
async function handleFriendNotification(
	payload: NotificationPayload,
	notifType: ToastActionType,
	shouldRefreshFriendList: boolean
) {
	const message = payload.data.message
	const fromUsername = payload.data.from.username

	notyf.open({
		type: notifType,
		message: message
	})

	if (shouldRefreshFriendList) {
		await fetchAndRenderFriendsList()
	}
}
