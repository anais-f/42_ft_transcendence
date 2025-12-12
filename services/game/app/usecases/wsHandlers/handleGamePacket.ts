import { WsTokenPayload } from '@ft_transcendence/security'
import { packetBuilder } from '@ft_transcendence/pong-shared/network/Packet/packetBuilder.js'
import { C01Move } from '@ft_transcendence/pong-shared/network/Packet/Client/C01.js'
import { TPlayerSlot, games } from '../managers/gameData.js'

export function handleGamePacket(
	data: Buffer,
	_user: WsTokenPayload,
	gameCode: string,
	playerSlot: TPlayerSlot
): void {
	const arrayBuffer = data.buffer.slice(
		data.byteOffset,
		data.byteOffset + data.byteLength
	) as ArrayBuffer
	const packet = packetBuilder.deserializeC(arrayBuffer)

	if (!packet) return

	if (packet instanceof C01Move) {
		handleMove(packet, gameCode, playerSlot)
	}
}

function handleMove(
	packet: C01Move,
	gameCode: string,
	playerSlot: TPlayerSlot
): void {
	const gameData = games.get(gameCode)
	if (!gameData?.gameInstance) return

	const movement =
		playerSlot === 'p1'
			? gameData.gameInstance.p1Movement
			: gameData.gameInstance.p2Movement

	movement.isMoving = packet.state
	movement.direction = packet.dir
}
