import { Segment } from '../math/Segment.js'
import { Vector2 } from '../math/Vector2.js'
import { PongBall } from './objects/PongBall.js'

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
	public startTime

	private border: Segment[] = [
		new Segment(new Vector2(-20, -10), new Vector2(20, -10)),
		new Segment(new Vector2(-20, 10), new Vector2(20, 10))
	]
	private winBorder: Segment[] = [
		new Segment(new Vector2(-20, -10), new Vector2(-20, 10)),
		new Segment(new Vector2(20, -10), new Vector2(20, 10))
	]
	private ball: PongBall = new PongBall(
		1,
		new Vector2(Math.random(), Math.random()).normalize()
	)

	constructor(TPS: number) {
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

	private playTick(): void {
		console.log(this.TPS_DATA.tickCount)

		++this.TPS_DATA.tickCount
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
