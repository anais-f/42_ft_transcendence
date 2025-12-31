import { PlayerData } from '../types/game.js'

class TournamentStore {
	private _tournamentCode: string | null = null
	private _players: (PlayerData | null)[] = []
	private _currentSlot: number = 0

	get tournamentCode(): string | null {
		return this._tournamentCode
	}

	set tournamentCode(code: string | null) {
		this._tournamentCode = code
	}

	get players(): (PlayerData | null)[] {
		return this._players
	}

	get currentSlot(): number {
		return this._currentSlot
	}

	set nextSlot(playerData: PlayerData) {
		this._setPlayer(this._currentSlot, playerData)
		this._currentSlot += 1
	}

	private _setPlayer(index: number, playerData: PlayerData | null) {
		if (index < 0 || index > 3) {
			console.error('Player index must be between 0 and 3')
			return
		}
		this._players[index] = playerData
	}

	clear() {
		this._tournamentCode = null
		this._players = []
	}
}

export const tournamentStore = new TournamentStore()
