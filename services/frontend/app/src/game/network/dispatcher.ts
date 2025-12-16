import { packetBuilder } from '@ft_transcendence/pong-shared/network/Packet/packetBuilder.js'
import {
	S02SegmentUpdate,
	S05BallPos,
	S06BallSync,
	S07Score,
	S08Countdown,
	S09DynamicSegments
} from '@ft_transcendence/pong-shared/network/Packet/Server/SPackets.js'
import { eogHandler } from './handlers/gameEnd.js'
import { opponentHandler } from './handlers/opponent.js'
import { startingInHandler } from './handlers/startingIn.js'
import { startHandler } from './handlers/gameStart.js'
import { slotHandler } from './handlers/slot.js'
import { scoreHandler } from './handlers/score.js'
import { countdownHandler } from './handlers/countdown.js'
import { renderer } from '../core/Renderer.js'

type JsonMessage = {
	type: string
	data?: unknown
}

const jsonHandlers: Record<string, (data: unknown) => void | Promise<void>> = {
	EOG: eogHandler,
	opponent: opponentHandler,
	startingIn: startingInHandler,
	start: startHandler,
	slot: slotHandler
}

function dispatcher(event: MessageEvent) {
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

function handleBinaryMessage(data: ArrayBuffer) {
	const packet = packetBuilder.deserializeS(data)
	if (!packet) return

	if (packet instanceof S02SegmentUpdate) {
		renderer.setStaticSegments(packet.segs)
	} else if (packet instanceof S09DynamicSegments) {
		renderer.setDynamicSegments(packet.segs)
	} else if (packet instanceof S06BallSync) {
		renderer.setBallState(packet.pos, packet.velo, packet.factor)
	} else if (packet instanceof S05BallPos) {
		renderer.setBallPos(packet.pos)
	} else if (packet instanceof S07Score) {
		scoreHandler(packet)
	} else if (packet instanceof S08Countdown) {
		countdownHandler(packet)
	}
}

export function setupNetworkDispatcher(ws: WebSocket): void {
	ws.addEventListener('message', dispatcher)
}

export function cleanupNetworkDispatcher(ws: WebSocket): void {
	ws.removeEventListener('message', dispatcher)
}

export { dispatcher }
