export type PlayerSlot = 'p1' | 'p2'

class GameStore {
	private gameCode: string | null = null
	private sessionToken: string | null = null
	private gameSocket: WebSocket | null = null
	private _navigatingToGame: boolean = false
	private _playerSlot: PlayerSlot = 'p1'

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

	clear(): void {
		if (this.gameSocket) {
			this.gameSocket.close()
		}
		this.gameCode = null
		this.sessionToken = null
		this.gameSocket = null
		this._navigatingToGame = false
		this._playerSlot = 'p1'
	}
}

export const gameStore = new GameStore()
