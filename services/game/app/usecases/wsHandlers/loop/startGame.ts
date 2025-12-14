import {
	GameState,
	BALL_SPEED,
	Vector2,
	S05BallPos
} from '@ft_transcendence/pong-shared'
import { S02SegmentUpdate } from '@ft_transcendence/pong-shared/network/Packet/Server/S02.js'
import { S06BallSync } from '@ft_transcendence/pong-shared/network/Packet/Server/S03/S06.js'
import { AS03BaseBall } from '@ft_transcendence/pong-shared/network/Packet/Server/S03/S03.js'
import { SPacketsType } from '@ft_transcendence/pong-shared/network/Packet/packetTypes.js'
import Bottleneck from 'bottleneck'
import { GameData } from '../../managers/gameData.js'
import { createGame, DEFAULT_TPS, IGameData } from '../../createGame.js'
import { PacketSender } from '../PacketSender.js'
import { updateHUDs } from './updateHUDs.js'
import { endGame } from '../../managers/gameManager/endGame.js'

export const MAX_SCORE = 5
export const PAD_SPEED = 0.3
export const PAUSE_TICKS = 180
export const COUNTDOWN_STEPS = 4
export const TICKS_PER_STEP = PAUSE_TICKS / COUNTDOWN_STEPS

export function startGame(gameData: GameData, gameCode: string): void {
	const gameInstance = createGame(MAX_SCORE)
	gameData.gameInstance = gameInstance

	const mapPacket = new S02SegmentUpdate(gameInstance.GE.borders)
	const mapBuffer = mapPacket.serialize()
	gameData.p1.ws?.send(mapBuffer)
	gameData.p2?.ws?.send(mapBuffer)

	const packetSender = new PacketSender(gameData)
	packetSender.start()

	gameInstance.GE.setState(GameState.Started)

	startGameLoop(gameData, gameCode, packetSender)
}

// TODO: move this somewhere else
function updatePadMovements(gameInstance: IGameData): void {
	if (gameInstance.p1Movement.isMoving) {
		gameInstance.pad1.move(gameInstance.p1Movement.direction, PAD_SPEED)
	}
	if (gameInstance.p2Movement.isMoving) {
		gameInstance.pad2.move(gameInstance.p2Movement.direction, PAD_SPEED)
	}
}

async function startGameLoop(
	gameData: GameData,
	gameCode: string,
	packetSender: PacketSender
): Promise<void> {
	const limiter = new Bottleneck({
		minTime: 1000 / DEFAULT_TPS,
		maxConcurrent: 1
	})

	const ballState = {
		pos: new Vector2(),
		velo: new Vector2(),
		factor: 0
	}

	const hudState = {
		lastP1Score: 0,
		lastP2Score: 0,
		lastCountdown: -1
	}

	while (
		gameData.gameInstance?.GE.state === GameState.Started &&
		gameData.status === 'active'
	) {
		await limiter.schedule(async () => {
			if (gameData.status !== 'active') return

			updatePadMovements(gameData.gameInstance!)

			const segPacket = new S02SegmentUpdate(gameData.gameInstance!.GE.borders)
			packetSender.push(SPacketsType.S02, segPacket)

			const ball = gameData.gameInstance!.GE.ball
			if (ball.velo.equals(ballState.velo)) {
				packetSender.push(
					SPacketsType.S05,
					new S05BallPos(AS03BaseBall.createS03(), ball.shape.pos)
				)
			} else {
				packetSender.push(
					SPacketsType.S06,
					new S06BallSync(ball.shape.pos, BALL_SPEED, ball.velo)
				)
			}

			updateHUDs(gameData, packetSender, hudState)
		})
	}

	packetSender.stop()
	endGame(gameCode)
}
