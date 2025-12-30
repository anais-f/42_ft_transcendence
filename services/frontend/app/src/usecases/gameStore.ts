import {
	PlayerSlot,
	PlayerData,
	OnOpponentJoinCallback
} from '../types/game.js'

class GameStore {
	private _gameCode: string | null = null
	private _sessionToken: string | null = null
	private _gameSocket: WebSocket | null = null
	private _navigatingToGame: boolean = false
	private _playerSlot: PlayerSlot = 'p1'
	private _p1: PlayerData | null = null
	private _p2: PlayerData | null = null
	private _onOpponentJoin: OnOpponentJoinCallback | null = null
	private _maxLives: number = 10

	get gameCode(): string | null {
		return this._gameCode
	}

	set gameCode(code: string | null) {
		this._gameCode = code
	}

	get sessionToken(): string | null {
		return this._sessionToken
	}

	set sessionToken(token: string | null) {
		this._sessionToken = token
	}

	get gameSocket(): WebSocket | null {
		return this._gameSocket
	}

	set gameSocket(socket: WebSocket | null) {
		this._gameSocket = socket
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

	get maxLives(): number {
		return this._maxLives
	}

	set maxLives(value: number) {
		this._maxLives = value
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
		if (this._gameSocket) {
			this._gameSocket.close()
		}
		this._gameCode = null
		this._sessionToken = null
		this._gameSocket = null
		this._navigatingToGame = false
		this._playerSlot = 'p1'
		this._p1 = null
		this._p2 = null
		this._onOpponentJoin = null
		this._maxLives = 10
	}
}

export const gameStore = new GameStore()
