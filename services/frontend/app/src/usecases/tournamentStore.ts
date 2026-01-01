import { PlayerData } from '../types/game.js'
import { UserByIdAPI } from '../api/usersApi.js'
import { currentUser } from './userStore.js'

class TournamentStore {
	private _tournamentCode: string | null = null
	private _players: (PlayerData | null)[] = []
	private _status: 'pending' | 'ongoing' | 'completed' = 'pending'

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

	async syncPlayers(participantIds: number[]) {
		const newPlayers: (PlayerData | null)[] = []

		for (const id of participantIds) {
			const existingPlayer = this._players.find((p) => p?.id === id)
			if (existingPlayer) {
				newPlayers.push(existingPlayer)
			} else {
				const result = await UserByIdAPI(id)
				if (!result.error && result.data) {
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
	}
}

export const tournamentStore = new TournamentStore()
