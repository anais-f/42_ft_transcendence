/**
 * SocialStore class to manage social WebSocket and session token.
 * Provides getters and setters for sessionToken and socialSocket.
 * Includes a clear method to reset the store.
 */
class SocialStore {
	private _sessionToken: string | null = null
	private _socialSocket: WebSocket | null = null

	get sessionToken(): string | null {
		return this._sessionToken
	}

	set sessionToken(token: string | null) {
		this._sessionToken = token
	}

	get socialSocket(): WebSocket | null {
		return this._socialSocket
	}

	set socialSocket(socket: WebSocket | null) {
		this._socialSocket = socket
	}

	clear() {
		console.log('[socialStore] Clearing social store...')
		if (this._socialSocket) {
			console.log('[socialStore] Closing WebSocket')
			this._socialSocket.close()
			this._socialSocket = null
		} else {
			console.log('[socialStore] No WebSocket to close')
		}
		this._sessionToken = null
		console.log('[socialStore] Store cleared')
	}
}

export const socialStore = new SocialStore()
