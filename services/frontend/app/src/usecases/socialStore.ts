// store global qui stocke la socket social et le token de session
// pour y accéder depuis n'importe quelle page

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
			if (this._socialSocket) {
				this._socialSocket.close()
				this._socialSocket = null
			}
			this._sessionToken = null
		}
}

export const socialStore = new SocialStore()