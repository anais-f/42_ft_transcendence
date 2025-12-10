import WebSocket from 'ws'

export function createWsError(socket: WebSocket, code: number, error: string) {
	socket.close(code, error)
	throw new Error(error)
}
