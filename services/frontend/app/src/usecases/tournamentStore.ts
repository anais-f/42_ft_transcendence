import { PlayerData } from '../types/game.js'
import { UserByIdAPI } from "../api/usersApi.js";
import { currentUser } from "./userStore.js"

class TournamentStore {
	private _tournamentCode: string | null = null
	private _players: (PlayerData | null)[] = []
	private _currentSlot: number = 0
  private _status : 'pending' | 'ongoing' | 'completed' = 'pending';

  get status(): 'pending' | 'ongoing' | 'completed' {
    return this._status;
  }

  set status(newStatus: 'pending' | 'ongoing' | 'completed') {
    this._status = newStatus;
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

  async addplayer(id: number) {
    if (this._players.find(player => player?.id === currentUser?.user_id)) {
      return
    }
    const newPlayer = await UserByIdAPI(id)
    if (newPlayer.error || !newPlayer.data) {
      console.error('Failed to fetch player data')
      return
    }
    const playerData = { id: newPlayer.data.id, username: newPlayer.data.username, avatar: newPlayer.data.avatar }
    this.nextSlot = playerData
  }

	clear() {
		this._tournamentCode = null
		this._players = []
	}
}

export const tournamentStore = new TournamentStore()
