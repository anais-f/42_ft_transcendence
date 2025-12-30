import {
	GameState,
	Vector2,
	Segment,
	S05BallPos,
	S09DynamicSegments,
	S02SegmentUpdate,
	S06BallSync,
	AS03BaseBall,
	MAX_LIVES,
	PAD_SPEED,
	DEFAULT_TPS
} from '@ft_transcendence/pong-shared'
import { SPacketsType } from '@ft_transcendence/pong-shared/network/Packet/packetTypes.js'
import Bottleneck from 'bottleneck'
import { GameData } from '../../managers/gameData.js'
import { createGame, IGameData } from '../../createGame.js'
import { PacketSender } from '../PacketSender.js'
import { updateHUDs } from './updateHUDs.js'
import { endGame } from '../../managers/gameManager/endGame.js'
import { updateGameMetrics } from '../../managers/metricsService.js'

function segmentsChanged(prev: Segment[], current: Segment[]): boolean {
	if (prev.length !== current.length) return true
	for (let i = 0; i < prev.length; i++) {
		if (
			!prev[i].p1.equals(current[i].p1) ||
			!prev[i].p2.equals(current[i].p2)
		) {
			return true
		}
	}
	return false
}

function cloneSegments(segs: Segment[]): Segment[] {
	return segs.map((s) => s.clone())
}

export function startGame(gameData: GameData, gameCode: string): void {
	const gameInstance = createGame(MAX_LIVES, gameData.mapOptions)
	updateGameMetrics()

	gameData.gameInstance = gameInstance

	// Register paddles with the game engine for synchronized updates
	gameInstance.GE.registerPaddles(
		[gameInstance.pad1, gameInstance.pad2],
		PAD_SPEED
	)

	const staticPacket = new S02SegmentUpdate(gameInstance.GE.staticBorders)
	const staticBuffer = staticPacket.serialize()
	gameData.p1.ws?.send(staticBuffer)
	gameData.p2?.ws?.send(staticBuffer)

	// Send initial dynamic segments immediately
	const dynamicPacket = new S09DynamicSegments(gameInstance.GE.dynamicBorders)
	const dynamicBuffer = dynamicPacket.serialize()
	gameData.p1.ws?.send(dynamicBuffer)
	gameData.p2?.ws?.send(dynamicBuffer)

	const packetSender = new PacketSender(gameData)
	packetSender.start()

	gameInstance.GE.setState(GameState.Started)

	startGameLoop(gameData, gameCode, packetSender)
}

function syncPaddleInputs(gameInstance: IGameData): void {
	gameInstance.GE.setPaddleInput(
		0,
		gameInstance.p1Movement.isMoving,
		gameInstance.p1Movement.direction
	)
	gameInstance.GE.setPaddleInput(
		1,
		gameInstance.p2Movement.isMoving,
		gameInstance.p2Movement.direction
	)
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
		lastP1Lives: 0,
		lastP2Lives: 0,
		lastCountdown: -1
	}

	let lastDynamicSegs: Segment[] = cloneSegments(
		gameData.gameInstance!.GE.dynamicBorders
	)

	while (
		gameData.gameInstance?.GE.state === GameState.Started &&
		gameData.status === 'active'
	) {
		await limiter.schedule(async () => {
			if (gameData.status !== 'active') {
				return
			}

			syncPaddleInputs(gameData.gameInstance!)

			gameData.gameInstance!.GE.playTick()

			const currentSegs = gameData.gameInstance!.GE.dynamicBorders
			if (segmentsChanged(lastDynamicSegs, currentSegs)) {
				const dynamicPacket = new S09DynamicSegments(currentSegs)
				packetSender.push(SPacketsType.S09, dynamicPacket)
				lastDynamicSegs = cloneSegments(currentSegs)
			}

			const ball = gameData.gameInstance!.GE.ball
			if (ball.velo.equals(ballState.velo)) {
				packetSender.push(
					SPacketsType.S05,
					new S05BallPos(AS03BaseBall.createS03(), ball.shape.pos)
				)
			} else {
				packetSender.push(
					SPacketsType.S06,
					new S06BallSync(ball.shape.pos, ball.speed, ball.velo)
				)
			}

			updateHUDs(gameData, packetSender, hudState)
		})
	}

	packetSender.stop()
	endGame(gameCode)
}
