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
import { updateStatusCircle } from '../../components/friends/StatusCircle.js'

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
 * Updates the online status of a friend in the friends list UI and profile page
 * @param userId - The ID of the user whose status has changed
 * @param status - The new status (1 for online, 0 for offline)
 */
function updateFriendStatus(userId: number, status: number) {
	const isOnline = status === 1
	const statusText = isOnline ? 'Online' : 'Offline'

	const friendStatusCircle = document.getElementById(`status_circle_${userId}`)
	const friendStatusText = document.getElementById(`status_text_${userId}`)
	if (friendStatusCircle) {
		updateStatusCircle(`status_circle_${userId}`, isOnline)
	}
	if (friendStatusText) {
		friendStatusText.textContent = statusText
	}

	const profilePath = window.location.pathname
	if (profilePath === `/profile/${userId}`) {
		updateStatusCircle('profile-status-circle', isOnline)
		const profileStatusText = document.getElementById('profile-status-text')
		if (profileStatusText) {
			profileStatusText.textContent = statusText
		}
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
