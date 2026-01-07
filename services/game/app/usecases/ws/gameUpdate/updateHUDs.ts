import { SPacketsType } from '@ft_transcendence/pong-shared/network/Packet/packetTypes.js'
import {
	TICKS_PER_STEP,
	S08Countdown,
	S07Score
} from '@ft_transcendence/pong-shared'
import { GameData } from '../../managers/gameData.js'
import { PacketSender } from '../PacketSender.js'

export function updateHUDs(
	gameData: GameData,
	packetSender: PacketSender,
	obj: { lastP1Lives: number; lastP2Lives: number; lastCountdown: number }
) {
	updateScoreHUD(gameData, packetSender, obj)
	updateCountDownHUD(gameData, packetSender, obj)
}

async function updateScoreHUD(
	gameData: GameData,
	packetSender: PacketSender,
	obj: { lastP1Lives: number; lastP2Lives: number; lastCountdown: number }
) {
	const score = gameData.gameInstance!.GE.lives
	if (score.p1 !== obj.lastP1Lives || score.p2 !== obj.lastP2Lives) {
		obj.lastP1Lives = score.p1
		obj.lastP2Lives = score.p2
		obj.lastCountdown = -1
		const maxLives = gameData.gameInstance!.GE.maxLives
		const scorePacket = new S07Score(score.p1, score.p2, maxLives)
		packetSender.push(SPacketsType.S07, scorePacket)
	}
}

async function updateCountDownHUD(
	gameData: GameData,
	packetSender: PacketSender,
	obj: { lastP1Lives: number; lastP2Lives: number; lastCountdown: number }
) {
	const pauseTicks = gameData.gameInstance!.GE.pauseTicksRemaining
	if (pauseTicks > 0) {
		const countdown = Math.ceil(pauseTicks / TICKS_PER_STEP)
		if (countdown !== obj.lastCountdown) {
			obj.lastCountdown = countdown
			const countdownPacket = new S08Countdown(countdown)
			packetSender.push(SPacketsType.S08, countdownPacket)
		}
	} else if (obj.lastCountdown > 0) {
		obj.lastCountdown = 0
		const countdownPacket = new S08Countdown(0)
		packetSender.push(SPacketsType.S08, countdownPacket)
	}
}
