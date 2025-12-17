import { WsTokenPayload } from '@ft_transcendence/security'
import { TPlayerSlot } from '../managers/gameData.js'

export function handleJsonMessage(
	message: unknown,
	user: WsTokenPayload,
	gameCode: string,
	playerSlot: TPlayerSlot
): void {
	console.log(`[JSON] ${user.login} (${playerSlot}):`, message)
}
