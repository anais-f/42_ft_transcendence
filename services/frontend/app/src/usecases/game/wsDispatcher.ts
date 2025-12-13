import { packetBuilder } from '@ft_transcendence/pong-shared/network/Packet/packetBuilder.js'
import { S02SegmentUpdate } from '@ft_transcendence/pong-shared/network/Packet/Server/S02.js'
import { S06BallSync } from '@ft_transcendence/pong-shared/network/Packet/Server/S03/S06.js'
import { S07Score } from '@ft_transcendence/pong-shared/network/Packet/Server/S07.js'
import { S08Countdown } from '@ft_transcendence/pong-shared/network/Packet/Server/S08.js'
import { eogHandler } from './handlers/eogHandler.js'
import { opponentHandler } from './handlers/opponentHandler.js'
import { startingInHandler } from './handlers/startingInHandler.js'
import { startHandler } from './handlers/startHandler.js'
import { slotHandler } from './handlers/slotHandler.js'
import { scoreHandler } from './handlers/scoreHandler.js'
import { countdownHandler } from './handlers/countdownHandler.js'
import { gameRenderer } from './gameRenderer.js'

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

function handleBinaryMessage(data: ArrayBuffer) {
	const packet = packetBuilder.deserializeS(data)
	if (!packet) return

	if (packet instanceof S02SegmentUpdate) {
		gameRenderer.setSegments(packet.segs)
	} else if (packet instanceof S06BallSync) {
		gameRenderer.setBallState(
			packet.getPos(),
			packet.getVelo(),
			packet.getFactor()
		)
	} else if (packet instanceof S07Score) {
		scoreHandler(packet)
	} else if (packet instanceof S08Countdown) {
		countdownHandler(packet)
	}
}
