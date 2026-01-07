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

export async function handleSocialDispatcher(message: MessageEvent) {
	try {
		const msg = JSON.parse(message.data)
		if (msg.type === WSMessageType.CONNECTION_ESTABLISHED) {
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

async function handleFriendRequest(payload: NotificationPayload) {
	const message = payload.data.message

	notyf.open({
		type: ToastActionType.FRIEND_REQUEST,
		message: message
	})

	await fetchAndRenderFriendRequests()
}

async function handleFriendNotification(
	payload: NotificationPayload,
	notifType: ToastActionType,
	shouldRefreshFriendList: boolean
) {
	const message = payload.data.message

	notyf.open({
		type: notifType,
		message: message
	})

	if (shouldRefreshFriendList) {
		await fetchAndRenderFriendsList()
	}
}
