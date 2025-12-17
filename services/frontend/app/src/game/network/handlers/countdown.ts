import { S08Countdown } from '@ft_transcendence/pong-shared/network/Packet/Server/S08.js'
import { renderer } from '../../core/Renderer.js'

export function countdownHandler(packet: S08Countdown) {
	renderer.setCountdown(packet.seconds > 0 ? packet.seconds : null)
}
