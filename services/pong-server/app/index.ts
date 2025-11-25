import {
	GameEngine,
	GameState,
	Segment,
	Vector2
} from '@ft_transcendence/pong-shared'
import {
	createScore,
	IScore
} from '@ft_transcendence/pong-shared/engine/IScore.js'

/* -------------- --- ---------------- */
/* -------------- map ---------------- */
const pointA = new Vector2(-20, -10)
const pointB = new Vector2(20, -10)
const pointC = new Vector2(20, 10)
const pointD = new Vector2(-20, 10)

const segA = new Segment(pointA, pointB)
const segB = new Segment(pointD, pointC)
const segC = new Segment(pointA, pointD)
const segD = new Segment(pointB, pointC)
/* -------------- --- ---------------- */

/* -------------- --- ---------------- */
/* -------------- pad ---------------- */
// NOTE: i clone points in pad cuz move function edit reference
const pointE = new Vector2(-18, -2)
const pointF = new Vector2(-18, 2)
const padSeg1 = new Segment(pointE.clone(), pointF.clone())
// @ts-ignore - TODO: use pad
const pad1 = new PongPad([padSeg1])

const pointG = new Vector2(18, -2)
const pointH = new Vector2(18, 2)
const padSeg2 = new Segment(pointG.clone(), pointH.clone())
// @ts-ignore - TODO: use pad
const pad2 = new PongPad([padSeg2])
/* -------------- --- ---------------- */

/* -------------- --- ---------------- */
/* ------------- gameE --------------- */
// TODO: start lobby management here instead of start a random game
const scoreData: IScore = createScore(5)
let GE = new GameEngine(
	60,
	scoreData,
	[segA, segB, segC, segD, padSeg1, padSeg2],
	[
		{ seg: segC, player: 1 },
		{ seg: segD, player: 2 }
	]
)

GE.setState(GameState.Started)
/* -------------- --- ---------------- */
