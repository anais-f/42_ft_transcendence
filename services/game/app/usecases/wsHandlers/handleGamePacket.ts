import { WsTokenPayload } from '@ft_transcendence/security'
import { TPlayerSlot } from '../managers/gameData.js'

export function handleGamePacket(
	data: Buffer,
	user: WsTokenPayload,
	gameCode: string,
	playerSlot: TPlayerSlot
): void {
	console.log(`[PACKET] ${user.login} (${playerSlot}): ${data.length} bytes`)
}
