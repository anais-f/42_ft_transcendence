import { NotificationPayload } from '@ft_transcendence/common'
import { sendToUser } from '../usecases/connectionManager.js'

export enum NotificationType {
	FriendRequest = 'friend:request',
	FriendAccept = 'friend:accept',
	FriendRemove = 'friend:remove',
	FriendReject = 'friend:reject'
}

const MessagesTemplates: Record<
	NotificationType,
	(username: string) => string
> = {
	[NotificationType.FriendRequest]: (username: string) =>
		`${username} has sent you a friend request.`,
	[NotificationType.FriendAccept]: (username: string) =>
		`${username} has accepted your friend request.`,
	[NotificationType.FriendRemove]: (username: string) =>
		`${username} has removed your friendship.`,
	[NotificationType.FriendReject]: (username: string) =>
		`${username} has rejected your friend request.`
}

export class NotificationService {
  static async sendNotification(
      type: NotificationType,
      fromUserId: string,
      fromUsername: string,
      toUserId: string
  ): Promise<boolean> {
    const notification: NotificationPayload = {
      type: type,
      data: {
        from: {
          userId: fromUserId,
          username: fromUsername
        },
        timestamp: new Date().toISOString(),
        message: MessagesTemplates[type](fromUsername)
      }
    }

    const sent = sendToUser(toUserId, notification)
    if (sent)
      console.log(
          `${type} notification sent to ${toUserId}: ${notification.type}`
      )
    else
      console.log(
          `User ${toUserId} not connected, ${type} notification not sent NOTIFICATION`
      )

    return sent
  }

  static friendRequest(
      fromUserId: string,
      fromUsername: string,
      toUserId: string
  ): Promise<boolean> {
    return this.sendNotification(
        NotificationType.FriendRequest,
        fromUserId,
        fromUsername,
        toUserId
    )
  }

  static friendAccepted(
      fromUserId: string,
      fromUsername: string,
      toUserId: string
  ): Promise<boolean> {
    return this.sendNotification(
        NotificationType.FriendAccept,
        fromUserId,
        fromUsername,
        toUserId
    )
  }

  static friendRemoved(
      fromUserId: string,
      fromUsername: string,
      toUserId: string
  ): Promise<boolean> {
    return this.sendNotification(
        NotificationType.FriendRemove,
        fromUserId,
        fromUsername,
        toUserId
    )
  }

  static friendRejected(
      fromUserId: string,
      fromUsername: string,
      toUserId: string
  ): Promise<boolean> {
    return this.sendNotification(
        NotificationType.FriendReject,
        fromUserId,
        fromUsername,
        toUserId
    )
  }
}
