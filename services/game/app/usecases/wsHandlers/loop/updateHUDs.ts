import { SPacketsType } from '@ft_transcendence/pong-shared/network/Packet/packetTypes.js'
import { GameData } from '../../managers/gameData.js'
import { S07Score } from '@ft_transcendence/pong-shared/network/Packet/Server/S07.js'
import { S08Countdown } from '@ft_transcendence/pong-shared/network/Packet/Server/S08.js'
import { TICKS_PER_STEP } from './startGame.js'
import { PacketSender } from '../PacketSender.js'

export function updateHUDs(
	gameData: GameData,
	packetSender: PacketSender,
	obj: { lastP1Score: number; lastP2Score: number; lastCountdown: number }
) {
	updateScoreHUD(gameData, packetSender, obj)
	updateCountDownHUD(gameData, packetSender, obj)
}

async function updateScoreHUD(
	gameData: GameData,
	packetSender: PacketSender,
	obj: { lastP1Score: number; lastP2Score: number; lastCountdown: number }
) {
	const score = gameData.gameInstance!.GE.getScore()
	if (score.p1 !== obj.lastP1Score || score.p2 !== obj.lastP2Score) {
		obj.lastP1Score = score.p1
		obj.lastP2Score = score.p2
		obj.lastCountdown = -1
		const scorePacket = new S07Score(Date.now(), score.p1, score.p2)
		packetSender.push(SPacketsType.S07, scorePacket)
	}
}

async function updateCountDownHUD(
	gameData: GameData,
	packetSender: PacketSender,
	obj: { lastP1Score: number; lastP2Score: number; lastCountdown: number }
) {
	const pauseTicks = gameData.gameInstance!.GE.getPauseTicksRemaining()
	if (pauseTicks > 0) {
		const countdown = Math.ceil(pauseTicks / TICKS_PER_STEP)
		if (countdown !== obj.lastCountdown) {
			obj.lastCountdown = countdown
			const countdownPacket = new S08Countdown(Date.now(), countdown)
			packetSender.push(SPacketsType.S08, countdownPacket)
		}
	} else if (obj.lastCountdown > 0) {
		obj.lastCountdown = 0
		const countdownPacket = new S08Countdown(Date.now(), 0)
		packetSender.push(SPacketsType.S08, countdownPacket)
	}
}
