import { db } from '../database/socialDatabase.js'
import { IUserId, RelationStatus } from '@ft_transcendence/common'

export type RelationRow = { relation_status: number }
export type RelationUserRow = { user_id: number; friend_id: number }

export class SocialRepository {
	private static getOrderedPair(a: IUserId, b: IUserId): [number, number] {
		return a.user_id < b.user_id
			? [a.user_id, b.user_id]
			: [b.user_id, a.user_id]
	}

	static getRelationStatus(user_id: IUserId, friend_id: IUserId): number {
		const selectStmt = db.prepare(
			'SELECT relation_status FROM relations WHERE (user_id = ? AND friend_id = ?)'
		)
		const [firstId, secondId] = this.getOrderedPair(user_id, friend_id)
		const row = selectStmt.get(firstId, secondId) as RelationRow | undefined
		return row ? row.relation_status : -1
	}

	static getFriendsCount(user_id: IUserId): number {
		const selectStmt = db.prepare(
			'SELECT COUNT(*) as count FROM relations WHERE relation_status = 1 AND (user_id = ? OR friend_id = ?)'
		)
		const row = selectStmt.get(user_id.user_id, user_id.user_id) as {
			count: number
		}
		return row.count
	}

	static addRelation(
		user_id: IUserId,
		friend_id: IUserId,
		origin_id: IUserId
	): void {
		if (this.getFriendsCount(user_id) >= 50)
			throw new Error('User has reached the maximum limit of 50 friends')
		if (this.getFriendsCount(friend_id) >= 50)
			throw new Error('Friend has reached the maximum limit of 50 friends')

		const insertStmt = db.prepare(
			'INSERT INTO relations (user_id, friend_id, origin_id, relation_status) VALUES (?, ?, ?, ?)'
		)
		const [firstId, secondId] = this.getOrderedPair(user_id, friend_id)
		insertStmt.run(firstId, secondId, origin_id.user_id, RelationStatus.PENDING)
	}

	static updateRelationStatus(
		user_id: IUserId,
		friend_id: IUserId,
		status: number
	): void {
		if (status === 1) {
			if (this.getFriendsCount(user_id) >= 50)
				throw new Error('User has reached the maximum limit of 50 friends')
			if (this.getFriendsCount(friend_id) >= 50)
				throw new Error('Friend has reached the maximum limit of 50 friends')
		}

		const updateStmt = db.prepare(
			'UPDATE relations SET relation_status = ? WHERE (user_id = ? AND friend_id = ?)'
		)
		const [firstId, secondId] = this.getOrderedPair(user_id, friend_id)
		updateStmt.run(status, firstId, secondId)
	}

	static deleteRelation(user_id: IUserId, friend_id: IUserId): void {
		const deleteStmt = db.prepare(
			'DELETE FROM relations WHERE user_id = ? AND friend_id = ?'
		)
		const [firstId, secondId] = this.getOrderedPair(user_id, friend_id)
		const result = deleteStmt.run(firstId, secondId)

		if (result.changes === 0) {
			throw new Error('Relation does not exist')
		}
	}

	static getFriendsList(user_id: IUserId): IUserId[] {
		const selectStmt = db.prepare(
			'SELECT user_id, friend_id FROM relations WHERE relation_status = ? AND (user_id = ? OR friend_id = ?)'
		)
		const rows = selectStmt.all(
			1,
			user_id.user_id,
			user_id.user_id
		) as RelationUserRow[]
		const friends: IUserId[] = []
		for (const row of rows) {
			if (row.user_id === user_id.user_id)
				friends.push({ user_id: row.friend_id })
			else friends.push({ user_id: row.user_id })
		}
		return friends
	}

	static getPendingListToApprove(user_id: IUserId): IUserId[] {
		const selectStmt = db.prepare(
			'SELECT user_id, friend_id FROM relations WHERE relation_status = ? AND origin_id != ? AND (user_id = ? OR friend_id = ?)'
		)
		const rows = selectStmt.all(
			0,
			user_id.user_id,
			user_id.user_id,
			user_id.user_id
		) as RelationUserRow[]
		const pending: IUserId[] = []
		for (const row of rows) {
			if (row.user_id === user_id.user_id)
				pending.push({ user_id: row.friend_id })
			else pending.push({ user_id: row.user_id })
		}
		return pending
	}

	static getPendingSentRequests(user_id: IUserId): IUserId[] {
		const selectStmt = db.prepare(
			'SELECT user_id, friend_id FROM relations WHERE relation_status = ? AND origin_id = ? AND (user_id = ? OR friend_id = ?)'
		)
		const rows = selectStmt.all(
			0,
			user_id.user_id,
			user_id.user_id,
			user_id.user_id
		) as RelationUserRow[]
		const pending: IUserId[] = []
		for (const row of rows) {
			if (row.user_id === user_id.user_id)
				pending.push({ user_id: row.friend_id })
			else pending.push({ user_id: row.user_id })
		}
		return pending
	}

	static getOriginId(user_id: IUserId, friend_id: IUserId): number | null {
		const selectStmt = db.prepare(
			'SELECT origin_id FROM relations WHERE (user_id = ? AND friend_id = ?)'
		)
		const [firstId, secondId] = this.getOrderedPair(user_id, friend_id)
		const row = selectStmt.get(firstId, secondId) as
			| { origin_id: number }
			| undefined
		return row ? row.origin_id : null
	}
}
