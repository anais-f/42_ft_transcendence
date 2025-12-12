export type PlayerSlot = 'p1' | 'p2'

export interface PlayerData {
	username: string
	avatar: string
}

export type OnOpponentJoinCallback = (opponent: PlayerData) => void

class GameStore {
	private gameCode: string | null = null
	private sessionToken: string | null = null
	private gameSocket: WebSocket | null = null
	private _navigatingToGame: boolean = false
	private _playerSlot: PlayerSlot = 'p1'
	private _p1: PlayerData | null = null
	private _p2: PlayerData | null = null
	private _onOpponentJoin: OnOpponentJoinCallback | null = null

	getGameCode(): string | null {
		return this.gameCode
	}

	setGameCode(code: string | null): void {
		this.gameCode = code
	}

	getSessionToken(): string | null {
		return this.sessionToken
	}

	setSessionToken(token: string | null): void {
		this.sessionToken = token
	}

	getGameSocket(): WebSocket | null {
		return this.gameSocket
	}

	setGameSocket(socket: WebSocket | null): void {
		this.gameSocket = socket
	}

	get navigatingToGame(): boolean {
		return this._navigatingToGame
	}

	set navigatingToGame(value: boolean) {
		this._navigatingToGame = value
	}

	get playerSlot(): PlayerSlot {
		return this._playerSlot
	}

	set playerSlot(slot: PlayerSlot) {
		this._playerSlot = slot
	}

	get p1(): PlayerData | null {
		return this._p1
	}

	set p1(data: PlayerData | null) {
		this._p1 = data
	}

	get p2(): PlayerData | null {
		return this._p2
	}

	set p2(data: PlayerData | null) {
		this._p2 = data
	}

	setOnOpponentJoin(callback: OnOpponentJoinCallback | null): void {
		this._onOpponentJoin = callback
	}

	notifyOpponentJoined(opponent: PlayerData): void {
		if (this._onOpponentJoin) {
			this._onOpponentJoin(opponent)
		}
	}

	clear(): void {
		if (this.gameSocket) {
			this.gameSocket.close()
		}
		this.gameCode = null
		this.sessionToken = null
		this.gameSocket = null
		this._navigatingToGame = false
		this._playerSlot = 'p1'
		this._p1 = null
		this._p2 = null
		this._onOpponentJoin = null
	}
}

export const gameStore = new GameStore()
