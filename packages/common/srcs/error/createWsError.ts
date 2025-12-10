import WebSocket from 'ws'

export function createWsError(socket: WebSocket, code: number, error: string) {
	socket.close(code, error)
	return new Error(error)
}
