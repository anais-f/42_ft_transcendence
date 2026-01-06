import { WsTokenPayload } from '@ft_transcendence/security'
import { TPlayerSlot } from '../../managers/gameData.js'

export function handleJsonMessage(
	_message: unknown,
	_user: WsTokenPayload,
	_gameCode: string,
	_playerSlot: TPlayerSlot
): void {}
