import { Circle } from '../math/Circle.js'
import { Segment } from '../math/Segment.js'
import { Vector2 } from '../math/Vector2.js'
import { IBall } from './IBall.js'
import { IScore } from './IScore.js'
import { IWinZone } from './IWinZone.js'

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

export class GameEngine {
	private currentState: GameState = GameState.Paused
	private TPS_DATA: TPS_MANAGER
	private tickTimer: ReturnType<typeof setInterval> | null = null
	private ball: IBall = {
		shape: new Circle(new Vector2(), 1.5),
		velo: new Vector2(Math.random(), Math.random()).normalize()
	}
	public startTime

	public constructor(
		TPS: number,
		private score: IScore,
		private borders: Segment[],
		private winZones: IWinZone[]
	) {
		this.TPS_DATA = new TPS_MANAGER(TPS)
		this.startTime = Date.now()
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

	private checkWin(seg: Segment): boolean {
		for (const w of this.winZones) {
			if (w.seg === seg) {
				++this.score[`p${w.player as 1 | 2}`]
				console.log(`score: [ ${this.score.p1} | ${this.score.p2} ]`)
				return true
			}
		}
		return false
	}

	// return if point is gained
	private checkColision(): boolean {
		for (const border of this.borders) {
			const hitData = border.intersect(this.ball.shape)
			if (Array.isArray(hitData) && hitData.length > 0) {
				if (this.checkWin(border)) {
					return true
				}

				const dirToPoint = Vector2.subtract(
					hitData[0],
					this.ball.shape.getPos()
				)
				const dot = Vector2.dot(border.getNormal(), dirToPoint)
				const velo: Vector2 = Vector2.reflect(
					this.ball.velo,
					border.getNormal()
				)
				if (dot < 0) {
					velo.negate()
				}
				this.ball.velo = velo
				return false
			}
		}
		return false
	}

	private playTick(): void {
		if (!this.checkColision()) {
			this.ball.shape.getPos().add(this.ball.velo)
		} else {
			this.ball.shape.getPos().setXY(0, 0)
			this.ball.velo = new Vector2(Math.random(), Math.random()).normalize()
		}

		++this.TPS_DATA.tickCount
		if (this.score.p1 + this.score.p2 >= this.score.max) {
			this.pauseGame()
		}

		console.log(
			`pos: {${this.ball.shape.getPos().getX().toFixed(2)} : ${this.ball.shape.getPos().getY().toFixed(2)}} | velo: {${this.ball.velo.getX().toFixed(2)} : ${this.ball.velo.getY().toFixed(2)}}`
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

	public getBall(): IBall {
		return this.ball
	}

	public getBorders(): Segment[] {
		return this.borders
	}
}
