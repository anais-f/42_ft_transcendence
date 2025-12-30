import {
	GameEngine,
	PongPad,
	Segment,
	Vector2,
	padDirection,
	DEFAULT_TPS,
	MapOptions,
	PaddleShape,
	ObstacleType,
	GAME_SPACE_WIDTH,
	GAME_SPACE_HEIGHT
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

interface ArenaBorders {
	borderDown: Segment
	borderUp: Segment
	borderL: Segment
	borderR: Segment
}

function createArenaBorders(): ArenaBorders {
	const halfWidth = GAME_SPACE_WIDTH / 2
	const halfHeight = GAME_SPACE_HEIGHT / 2

	const pointA = new Vector2(-halfWidth, -halfHeight)
	const pointB = new Vector2(halfWidth, -halfHeight)
	const pointC = new Vector2(halfWidth, halfHeight)
	const pointD = new Vector2(-halfWidth, halfHeight)

	return {
		borderDown: new Segment(pointA, pointB),
		borderUp: new Segment(pointD, pointC),
		borderL: new Segment(pointA, pointD),
		borderR: new Segment(pointB, pointC)
	}
}

function createClassicPaddles(
	borderDown: Segment,
	borderUp: Segment
): { pad1: PongPad; pad2: PongPad; segments: Segment[] } {
	const pointE = new Vector2(-16, -2)
	const pointF = new Vector2(-16, 2)
	const padSeg1 = new Segment(pointE.clone(), pointF.clone())

	const pointG = new Vector2(16, -2)
	const pointH = new Vector2(16, 2)
	const padSeg2 = new Segment(pointG.clone(), pointH.clone())

	return {
		pad1: new PongPad([padSeg1], [borderDown, borderUp]),
		pad2: new PongPad([padSeg2], [borderDown, borderUp]),
		segments: [padSeg1, padSeg2]
	}
}

function createVPaddles(
	borderDown: Segment,
	borderUp: Segment
): { pad1: PongPad; pad2: PongPad; segments: Segment[] } {
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

	return {
		pad1: new PongPad([padSegL1, padSegL2], [borderDown, borderUp]),
		pad2: new PongPad([padSegR1, padSegR2], [borderDown, borderUp]),
		segments: [padSegL1, padSegL2, padSegR1, padSegR2]
	}
}

function createDiamondObstacles(): Segment[] {
	const dTop1 = new Vector2(0, 8)
	const dRight1 = new Vector2(2, 6)
	const dBottom1 = new Vector2(0, 4)
	const dLeft1 = new Vector2(-2, 6)

	const dTop2 = new Vector2(0, -4)
	const dRight2 = new Vector2(2, -6)
	const dBottom2 = new Vector2(0, -8)
	const dLeft2 = new Vector2(-2, -6)

	return [
		new Segment(dTop1, dRight1),
		new Segment(dRight1, dBottom1),
		new Segment(dBottom1, dLeft1),
		new Segment(dLeft1, dTop1),
		new Segment(dTop2, dRight2),
		new Segment(dRight2, dBottom2),
		new Segment(dBottom2, dLeft2),
		new Segment(dLeft2, dTop2)
	]
}

function createHexagonObstacles(): Segment[] {
	// Top hexagon (centered at y=6)
	const h1Left = new Vector2(-6, 6)
	const h1TopLeft = new Vector2(-4, 7)
	const h1TopRight = new Vector2(4, 7)
	const h1Right = new Vector2(6, 6)
	const h1BottomRight = new Vector2(4, 5)
	const h1BottomLeft = new Vector2(-4, 5)

	// Bottom hexagon (centered at y=-6)
	const h2Left = new Vector2(-6, -6)
	const h2TopLeft = new Vector2(-4, -5)
	const h2TopRight = new Vector2(4, -5)
	const h2Right = new Vector2(6, -6)
	const h2BottomRight = new Vector2(4, -7)
	const h2BottomLeft = new Vector2(-4, -7)

	return [
		// Top hexagon
		new Segment(h1Left, h1TopLeft),
		new Segment(h1TopLeft, h1TopRight),
		new Segment(h1TopRight, h1Right),
		new Segment(h1Right, h1BottomRight),
		new Segment(h1BottomRight, h1BottomLeft),
		new Segment(h1BottomLeft, h1Left),
		// Bottom hexagon
		new Segment(h2Left, h2TopLeft),
		new Segment(h2TopLeft, h2TopRight),
		new Segment(h2TopRight, h2Right),
		new Segment(h2Right, h2BottomRight),
		new Segment(h2BottomRight, h2BottomLeft),
		new Segment(h2BottomLeft, h2Left)
	]
}

export function createGame(maxScore: number, options: MapOptions): IGameData {
	const { borderDown, borderUp, borderL, borderR } = createArenaBorders()

	const paddleCreators = {
		[PaddleShape.Classic]: () => createClassicPaddles(borderDown, borderUp),
		[PaddleShape.V]: () => createVPaddles(borderDown, borderUp)
	}

	const obstacleCreators: Record<ObstacleType, () => Segment[]> = {
		[ObstacleType.None]: () => [],
		[ObstacleType.Diamonds]: createDiamondObstacles,
		[ObstacleType.Hexagons]: createHexagonObstacles
	}

	const paddleData = paddleCreators[options.paddleShape]()
	const obstacles = obstacleCreators[options.obstacle]()

	const staticSegments = [borderDown, borderUp, borderL, borderR, ...obstacles]

	return {
		GE: new GameEngine(
			DEFAULT_TPS,
			createScore(maxScore),
			staticSegments,
			paddleData.segments,
			[
				{ seg: borderL, player: 1 },
				{ seg: borderR, player: 2 }
			],
			maxScore
		),
		pad1: paddleData.pad1,
		pad2: paddleData.pad2,
		p1Movement: { isMoving: false, direction: padDirection.UP },
		p2Movement: { isMoving: false, direction: padDirection.UP }
	}
}
