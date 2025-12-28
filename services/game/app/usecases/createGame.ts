import {
	GameEngine,
	PongPad,
	Segment,
	Vector2,
	padDirection,
	DEFAULT_TPS
} from '@ft_transcendence/pong-shared'
import { createScore } from '@ft_transcendence/pong-shared/engine/IScore.js'

export interface PlayerMovement {
	isMoving: boolean
	direction: padDirection
}

export interface IGameData {
	GE: GameEngine
	pad1: PongPad
	pad2: PongPad
	p1Movement: PlayerMovement
	p2Movement: PlayerMovement
}

// Map with diamond obstacles and V-shaped pads
export function createDiamondMap(maxScore: number): IGameData {
	const pointA = new Vector2(-20, -10)
	const pointB = new Vector2(20, -10)
	const pointC = new Vector2(20, 10)
	const pointD = new Vector2(-20, 10)

	const borderDown = new Segment(pointA, pointB)
	const borderUp = new Segment(pointD, pointC)
	const borderL = new Segment(pointA, pointD)
	const borderR = new Segment(pointB, pointC)

	const dTop1 = new Vector2(0, 8)
	const dRight1 = new Vector2(2, 6)
	const dBottom1 = new Vector2(0, 4)
	const dLeft1 = new Vector2(-2, 6)
	const diamondTopSeg1 = new Segment(dTop1, dRight1)
	const diamondTopSeg2 = new Segment(dRight1, dBottom1)
	const diamondTopSeg3 = new Segment(dBottom1, dLeft1)
	const diamondTopSeg4 = new Segment(dLeft1, dTop1)

	const dTop2 = new Vector2(0, -4)
	const dRight2 = new Vector2(2, -6)
	const dBottom2 = new Vector2(0, -8)
	const dLeft2 = new Vector2(-2, -6)
	const diamondBotSeg1 = new Segment(dTop2, dRight2)
	const diamondBotSeg2 = new Segment(dRight2, dBottom2)
	const diamondBotSeg3 = new Segment(dBottom2, dLeft2)
	const diamondBotSeg4 = new Segment(dLeft2, dTop2)

	const padL_top = new Vector2(-16, 2)
	const padL_mid = new Vector2(-15, 0)
	const padL_bot = new Vector2(-16, -2)
	const padSegL1 = new Segment(padL_top.clone(), padL_mid.clone())
	const padSegL2 = new Segment(padL_mid.clone(), padL_bot.clone())

	const padR_top = new Vector2(16, 2)
	const padR_mid = new Vector2(15, 0)
	const padR_bot = new Vector2(16, -2)
	const padSegR1 = new Segment(padR_top.clone(), padR_mid.clone())
	const padSegR2 = new Segment(padR_mid.clone(), padR_bot.clone())

	const pad1 = new PongPad([padSegL1, padSegL2], [borderDown, borderUp])
	const pad2 = new PongPad([padSegR1, padSegR2], [borderDown, borderUp])

	const staticSegments = [
		borderDown,
		borderUp,
		borderL,
		borderR,
		diamondTopSeg1,
		diamondTopSeg2,
		diamondTopSeg3,
		diamondTopSeg4,
		diamondBotSeg1,
		diamondBotSeg2,
		diamondBotSeg3,
		diamondBotSeg4
	]

	const dynamicSegments = [padSegL1, padSegL2, padSegR1, padSegR2]

	return {
		GE: new GameEngine(
			DEFAULT_TPS,
			createScore(maxScore),
			staticSegments,
			dynamicSegments,
			[
				{ seg: borderL, player: 1 },
				{ seg: borderR, player: 2 }
			],
			maxScore
		),
		pad1: pad1,
		pad2: pad2,
		p1Movement: { isMoving: false, direction: padDirection.UP },
		p2Movement: { isMoving: false, direction: padDirection.UP }
	}
}

// classic game
export function createGame(maxScore: number): IGameData {
	const pointA = new Vector2(-20, -10)
	const pointB = new Vector2(20, -10)
	const pointC = new Vector2(20, 10)
	const pointD = new Vector2(-20, 10)

	const borderDown = new Segment(pointA, pointB)
	const borderUp = new Segment(pointD, pointC)
	const borderL = new Segment(pointA, pointD)
	const borderR = new Segment(pointB, pointC)

	// pad L
	const pointE = new Vector2(-16, -2)
	const pointF = new Vector2(-16, 2)
	const padSeg1 = new Segment(pointE.clone(), pointF.clone())

	// pad R
	const pointG = new Vector2(16, -2)
	const pointH = new Vector2(16, 2)
	const padSeg2 = new Segment(pointG.clone(), pointH.clone())

	const pad1 = new PongPad([padSeg1], [borderDown, borderUp])
	const pad2 = new PongPad([padSeg2], [borderDown, borderUp])

	const staticSegments = [borderDown, borderUp, borderL, borderR]
	const dynamicSegments = [padSeg1, padSeg2]

	return {
		GE: new GameEngine(
			DEFAULT_TPS,
			createScore(maxScore),
			staticSegments,
			dynamicSegments,
			[
				{ seg: borderL, player: 1 },
				{ seg: borderR, player: 2 }
			],
			maxScore
		),
		pad1: pad1,
		pad2: pad2,
		p1Movement: { isMoving: false, direction: padDirection.UP },
		p2Movement: { isMoving: false, direction: padDirection.UP }
	}
}
