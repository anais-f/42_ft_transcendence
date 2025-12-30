import { S08Countdown } from '@pong-shared/index.js'
import { renderer } from '../../core/Renderer.js'

export function countdownHandler(packet: S08Countdown) {
	renderer.setCountdown(packet.seconds > 0 ? packet.seconds : null)
}
