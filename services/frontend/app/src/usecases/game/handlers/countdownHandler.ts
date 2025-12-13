import { S08Countdown } from '@ft_transcendence/pong-shared/network/Packet/Server/S08.js'
import { gameRenderer } from '../gameRenderer.js'

export function countdownHandler(packet: S08Countdown) {
	gameRenderer.setCountdown(packet.seconds > 0 ? packet.seconds : null)
}
