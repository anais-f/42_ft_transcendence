import { PlayerData } from '../types/game.js'
import { UserByIdAPI } from '../api/usersApi.js'
import { currentUser } from './userStore.js'

class TournamentStore {
	private _tournamentCode: string | null = null
	private _players: (PlayerData | null)[] = []
	private _status: 'pending' | 'ongoing' | 'completed' = 'pending'
	private _playersMap = new Map<number, PlayerData>()
	private _gameCode1: string | undefined = undefined
	private _gameCode2: string | undefined = undefined

	get gameCode1(): string | undefined {
		return this._gameCode1
	}

	get gameCode2(): string | undefined {
		return this._gameCode2
	}

	set gameCode2(value: string | undefined) {
		this._gameCode2 = value
	}

	set gameCode1(value: string | undefined) {
		this._gameCode1 = value
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

	get players(): (PlayerData | null)[] {
		return this._players
	}

	get playersMap(): Map<number, PlayerData> {
		return this._playersMap
	}

	async syncPlayers(participantIds: number[]) {
		const newPlayers: (PlayerData | null)[] = []

		for (const id of participantIds) {
			const existingPlayer = this._players.find((p) => p?.id === id)
			if (existingPlayer) {
				newPlayers.push(existingPlayer)
			} else {
				const result = await UserByIdAPI(id)
				if (!result.error && result.data) {
					this._playersMap.set(id, result.data)
					newPlayers.push({
						id: result.data.user_id,
						username: result.data.username,
						avatar: result.data.avatar
					})
				}
			}
		}

		while (newPlayers.length < 4) {
			newPlayers.push(null)
		}

		this._players = newPlayers
	}

	clear() {
		this._tournamentCode = null
		this._players = []
		this._status = 'pending'
		this._gameCode1 = undefined
		this._gameCode2 = undefined
	}
}

export const tournamentStore = new TournamentStore()
