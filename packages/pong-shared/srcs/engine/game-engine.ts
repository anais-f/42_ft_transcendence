import { Segment } from '../math/Segment.js'
import { Polygon } from '../math/shapes/Polygon.js'
import { Vector2 } from '../math/Vector2.js'
import { PongBall } from './objects/PongBall.js'
import { PongObject } from './objects/PongObject.js'
import { PongPad } from './objects/PongPad.js'

export class TPS_MANAGER {
	public TPS_INTERVAL_MS: number
	public previousTime_MS: number = 0
	public tickCount: number = 0

	constructor(public TPS: number) {
		this.TPS = TPS
		this.TPS_INTERVAL_MS = 1000 / TPS
	}
}

export enum GameState {
	Paused,
	Started
}

// This is because Segment can't intersect with PongObject but PongObject can
interface IBorderFix {
	seg: Segment
	pol: PongObject
}

export class GameEngine {
	private currentState: GameState = GameState.Paused
	private TPS_DATA: TPS_MANAGER
	private tickTimer: ReturnType<typeof setInterval> | null = null
	public startTime
	public lastBounce: PongObject | null = null

	private border: IBorderFix[] = [
		GameEngine.buildBorder(
			new Segment(new Vector2(-20, -10), new Vector2(20, -10))
		),
		GameEngine.buildBorder(
			new Segment(new Vector2(-20, 10), new Vector2(20, 10))
		)
	]

	private winBorder: IBorderFix[] = [
		GameEngine.buildBorder(
			new Segment(new Vector2(-20, -10), new Vector2(-20, 10))
		),
		GameEngine.buildBorder(
			new Segment(new Vector2(20, -10), new Vector2(20, 10))
		)
	]
	private ball: PongBall = new PongBall(
		2,
		new Vector2(Math.random(), Math.random()).normalize()
	)
	private pads: PongPad[] = [
		new PongPad(
			1,
			new PongObject(
				new Polygon(
					[
						new Vector2(-0.5, -2),
						new Vector2(0.5, -2),
						new Vector2(0.5, 2),
						new Vector2(-0.5, 2)
					],
					new Vector2()
				),
				new Vector2(-18, -2)
			)
		),
		new PongPad(
			2,
			new PongObject(
				new Polygon(
					[
						new Vector2(-0.5, -2),
						new Vector2(0.5, -2),
						new Vector2(0.5, 2),
						new Vector2(-0.5, 2)
					],
					new Vector2()
				),
				new Vector2(17, -2)
			)
		)
	]

	public constructor(TPS: number) {
		this.TPS_DATA = new TPS_MANAGER(TPS)
		this.startTime = Date.now()
	}

	private static buildBorder(seg: Segment): IBorderFix {
		return {
			seg: seg,
			pol: new PongObject(
				new Polygon(seg.getPoints(), new Vector2()),
				new Vector2()
			)
		}
	}

	private startGame(): void {
		if (this.currentState === GameState.Started) return
		this.currentState = GameState.Started
		this.TPS_DATA.previousTime_MS = Date.now()
		this.startTickLoop()
	}

	private pauseGame(): void {
		this.currentState = GameState.Paused
		if (this.tickTimer !== null) {
			clearInterval(this?.tickTimer)
			this.tickTimer = null
		}
	}

	public setState(gameState: GameState): void {
		switch (gameState) {
			case GameState.Started:
				this.startGame()
				break
			case GameState.Paused:
				this.pauseGame()
				break
		}
	}

	private playTick(): void {
		function bounceBorder(
			borders: IBorderFix[],
			ball: PongBall,
			skip: PongObject | null
		): boolean {
			for (const border of borders) {
				if (border.pol === skip) {
					continue
				}
				const intersect = ball.getObj().intersect(border.pol)
				if (intersect !== null) {
					console.log('bounce')
					ball.velo = Vector2.reflect(ball.velo, border.seg.getNormal())
					skip = border.pol
					return true
				}
			}
			return false
		}
		++this.TPS_DATA.tickCount

		for (const endBorder of this.winBorder) {
			const hit = this.ball.getObj().intersect(endBorder.pol)
			if (hit !== null) {
				console.log('point gained')
				this.ball.velo = new Vector2(
					Math.random() * 1.2,
					Math.random()
				).normalize()
				this.ball.getPos().setXY(0, 0)
				return
			}
		}

		bounceBorder(this.border, this.ball, this.lastBounce)

		this.ball.getPos().add(this.ball.velo)
		console.log(
			`pos:{${this.ball.getPos().getX().toFixed(2)} : ${this.ball.getPos().getY().toFixed(2)}} velo:{${this.ball.velo.getX().toFixed(2)} : ${this.ball.velo.getY().toFixed(2)}}`
		)
	}

	private startTickLoop(): void {
		const tickInterval = this.TPS_DATA.TPS_INTERVAL_MS
		this.tickTimer = this.scheduleTick((now: number) => {
			if (this.currentState !== GameState.Started) {
				return
			}
			this.playTick()
			this.TPS_DATA.previousTime_MS = now
		}, tickInterval)
	}

	public getSyncedTimeMs(): number {
		return Date.now()
	}

	private scheduleTick(
		fn: (now: number) => void,
		intervalMs: number
	): ReturnType<typeof setInterval> {
		return setInterval(() => fn(Date.now()), intervalMs)
	}

	public getState(): GameState {
		return this.currentState
	}

	public getTickCount(): number {
		return this.TPS_DATA.tickCount
	}
}
