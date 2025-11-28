import WebSocket from 'ws'
import { wsConnections } from '../usecases/connectionManager.js'

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
