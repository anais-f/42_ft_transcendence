import { eogHandler } from './handlers/eogHandler.js'
import { opponentHandler } from './handlers/opponentHandler.js'

type JsonMessage = {
	type: string
	data?: unknown
}

const jsonHandlers: Record<string, (data: unknown) => void | Promise<void>> = {
	EOG: eogHandler,
	opponent: opponentHandler
}

export function wsDispatcher(event: MessageEvent) {
	if (event.data instanceof ArrayBuffer) {
		handleBinaryMessage(event.data)
		return
	}

	handleJsonMessage(event.data)
}

function handleJsonMessage(data: string) {
	const msg: JsonMessage = JSON.parse(data)
	const handler = jsonHandlers[msg.type]

	if (handler) {
		handler(msg.data)
	} else {
		console.warn('Unknown message type:', msg.type)
	}
}

function handleBinaryMessage(_data: ArrayBuffer) {
	// TODO: handle game packets
}
