import { db } from '../database/socialDatabase.js'
import { IUserId} from '@ft_transcendence/common'

// Table relations
// 0 -> pending
// 1 -> friends


export class SocialRepository {
  //TODO : verifier que les 2 id existent avant d'ajouter la relation

  private static getOrderedPair(a: IUserId, b: IUserId): [number, number] {
    return a.id_user < b.id_user ? [a.id_user, b.id_user] : [b.id_user, a.id_user]
  }

   static relationExisted(id_user: IUserId, friend_id: IUserId): boolean {
    const selectStmt = db.prepare(
      'SELECT 1 FROM relations WHERE (id_user = ? AND friend_id = ?)')
    const [firstId, secondId] = this.getOrderedPair(id_user, friend_id)
    const row = selectStmt.get(firstId, secondId)
    return !!row
  }

  static relationStatus(id_user: IUserId, friend_id: IUserId): number {
    const selectStmt = db.prepare(
      'SELECT relation_status FROM relations WHERE (id_user = ? AND friend_id = ?)')
    const [firstId, secondId] = this.getOrderedPair(id_user, friend_id)
    const row = selectStmt.get(firstId, secondId)
    return row ? row.relation_status : -1
  }

  static addRelation(id_user: IUserId, friend_id: IUserId, origin_id: IUserId): void {
    const insertStmt = db.prepare('INSERT INTO relations (id_user, friend_id, origin_id, relation_status) VALUES (?, ?, ?, ?)')
    const [firstId, secondId] = this.getOrderedPair(id_user, friend_id)
    insertStmt.run(firstId, secondId, origin_id.id_user, 0)
  }

  static updateRelationStatus(id_user: IUserId, friend_id: IUserId, status: number): void {
    const updateStmt = db.prepare('UPDATE relations SET relation_status = ? WHERE (id_user = ? AND friend_id = ?)')
    const [firstId, secondId] = this.getOrderedPair(id_user, friend_id)
    updateStmt.run(status, firstId, secondId)
  }

  static deleteRelation(id_user: IUserId, friend_id: IUserId): void {
    const selectStmt = db.prepare('DELETE FROM relations WHERE id_user = ? AND friend_id = ?')
    const [firstId, secondId] = this.getOrderedPair(id_user, friend_id)
    selectStmt.run(firstId, secondId)
  }

  static findFriendsList(id_user: IUserId): IUserId[] {
    const selectStmt = db.prepare('SELECT id_user, friend_id FROM relations WHERE relation_status = ? AND (id_user = ? OR friend_id = ?)')
    const rows = selectStmt.all(1, id_user.id_user, id_user.id_user)
    const friends: IUserId[] = []
    for (const row of rows) {
      if (row.id_user === id_user.id_user)
        friends.push({ id_user: row.friend_id })
      else
        friends.push({ id_user: row.id_user })
    }
    return friends
  }

  static findPendingListToApprove(id_user: IUserId): IUserId[] {
    const selectStmt = db.prepare('SELECT id_user, friend_id FROM relations WHERE relation_status = ? AND origin_id != ? AND (id_user = ? OR friend_id = ?)')
    const rows = selectStmt.all(0, id_user.id_user, id_user.id_user, id_user.id_user)
    const pending: IUserId[] = []
    for (const row of rows) {
      if (row.id_user === id_user.id_user)
        pending.push({ id_user: row.friend_id })
      else
        pending.push({ id_user: row.id_user })
    }
    return pending
  }
}
