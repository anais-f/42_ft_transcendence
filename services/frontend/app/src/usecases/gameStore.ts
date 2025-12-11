class GameStore {
	private gameCode: string | null = null
	private sessionToken: string | null = null
	private gameSocket: WebSocket | null = null

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

	clear(): void {
		if (this.gameSocket) {
			this.gameSocket.close()
		}
		this.gameCode = null
		this.sessionToken = null
		this.gameSocket = null
	}
}

export const gameStore = new GameStore()
