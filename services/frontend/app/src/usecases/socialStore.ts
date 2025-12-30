/**
 * SocialStore class to manage social WebSocket and session token.
 * Provides getters and setters for sessionToken and socialSocket.
 * Includes a clear method to reset the store.
 */
class SocialStore {
	private _socialSocket: WebSocket | null = null

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
	}
}

export const socialStore = new SocialStore()
