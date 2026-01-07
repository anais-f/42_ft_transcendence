import { PlayerData } from '../types/game.js'
import { userByIdAPI } from '../api/usersApi.js'

class TournamentStore {
	private _tournamentCode: string | null = null
	private _playerIds: number[] = []
	private _status: 'pending' | 'ongoing' | 'completed' = 'pending'
	private _playersMap = new Map<number, PlayerData>()
	private _joinedGameCodes = new Set<string>()

	hasJoinedGame(gameCode: string): boolean {
		return this._joinedGameCodes.has(gameCode)
	}

	markGameAsJoined(gameCode: string): void {
		this._joinedGameCodes.add(gameCode)
	}

	unmarkGameAsJoined(gameCode: string): void {
		this._joinedGameCodes.delete(gameCode)
	}

	get status(): 'pending' | 'ongoing' | 'completed' {
		return this._status
	}

	set status(newStatus: 'pending' | 'ongoing' | 'completed') {
		this._status = newStatus
	}

	get tournamentCode(): string | null {
		return this._tournamentCode
	}

	set tournamentCode(code: string | null) {
		this._tournamentCode = code
	}

	get playerIds(): number[] {
		return this._playerIds
	}

	get playersMap(): Map<number, PlayerData> {
		return this._playersMap
	}

	getPlayer(index: number): PlayerData | null {
		const id = this._playerIds[index]
		return id ? (this._playersMap.get(id) ?? null) : null
	}

	async syncPlayers(participantIds: number[]): Promise<void> {
		for (const id of participantIds) {
			if (this._playersMap.has(id)) continue

			const result = await userByIdAPI(id)
			if (!result.error && result.data) {
				this._playersMap.set(id, {
					id: result.data.user_id,
					username: result.data.username,
					avatar: result.data.avatar
				})
			}
		}

		this._playerIds = participantIds
	}

	clear(): void {
		this._tournamentCode = null
		this._playerIds = []
		this._status = 'pending'
		this._playersMap.clear()
		this._joinedGameCodes.clear()
	}
}

export const tournamentStore = new TournamentStore()
