import {
	GameEngine,
	PongPad,
	Segment,
	Vector2
} from '@ft_transcendence/pong-shared'
import { createScore } from '@ft_transcendence/pong-shared/engine/IScore.js'

export const DEFAULT_TPS = 10

export interface IGameData {
	GE: GameEngine
	pad1: PongPad
	pad2: PongPad
}

export function createGame(maxScore: number): IGameData {
	const pointA = new Vector2(-20, -10)
	const pointB = new Vector2(20, -10)
	const pointC = new Vector2(20, 10)
	const pointD = new Vector2(-20, 10)

	const segA = new Segment(pointA, pointB)
	const segB = new Segment(pointD, pointC)
	const segC = new Segment(pointA, pointD)
	const segD = new Segment(pointB, pointC)

	const pointE = new Vector2(-16, -2)
	const pointF = new Vector2(-16, 2)
	const pointG = new Vector2(16, -2)
	const pointH = new Vector2(16, 2)

	const padSeg2 = new Segment(pointG.clone(), pointH.clone())
	const padSeg1 = new Segment(pointE.clone(), pointF.clone())

	const pad1 = new PongPad([padSeg1], [segA, segB])
	const pad2 = new PongPad([padSeg2], [segA, segB])

	return {
		GE: new GameEngine(
			DEFAULT_TPS,
			createScore(maxScore),
			[segA, segB, segC, segD, padSeg1, padSeg2],
			[
				{ seg: segC, player: 1 },
				{ seg: segD, player: 2 }
			]
		),
		pad1: pad1,
		pad2: pad2
	}
}
