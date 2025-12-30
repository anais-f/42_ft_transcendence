import { TPlayerSlot, games } from '../managers/gameData.js'
import {
	C01Move,
	C02RequestScore,
	packetBuilder,
	S07Score
} from '@ft_transcendence/pong-shared'

export function handleGamePacket(
	data: Buffer,
	gameCode: string,
	playerSlot: TPlayerSlot
): void {
	const arrayBuffer = data.buffer.slice(
		data.byteOffset,
		data.byteOffset + data.byteLength
	) as ArrayBuffer
	const packet = packetBuilder.deserializeC(arrayBuffer)

	if (!packet) {
		return
	}

	if (packet instanceof C01Move) {
		handleMove(packet, gameCode, playerSlot)
	} else if (packet instanceof C02RequestScore) {
		handleRequestScore(gameCode, playerSlot)
	}
}

function handleMove(
	packet: C01Move,
	gameCode: string,
	playerSlot: TPlayerSlot
): void {
	const gameData = games.get(gameCode)
	if (!gameData?.gameInstance) {
		return
	}

	const movement =
		playerSlot === 'p1'
			? gameData.gameInstance.p1Movement
			: gameData.gameInstance.p2Movement

	movement.isMoving = packet.state
	movement.direction = packet.dir
}

function handleRequestScore(gameCode: string, playerSlot: TPlayerSlot): void {
	const gameData = games.get(gameCode)
	if (!gameData?.gameInstance) {
		return
	}

	const ws = playerSlot === 'p1' ? gameData.p1.ws : gameData.p2?.ws
	if (!ws) {
		return
	}

	const score = gameData.gameInstance.GE.lives
	const maxLives = gameData.gameInstance.GE.maxLives
	const scorePacket = new S07Score(score.p1, score.p2, maxLives)

	ws.send(scorePacket.serialize())
}
