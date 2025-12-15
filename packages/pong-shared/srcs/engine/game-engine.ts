import Bottleneck from 'bottleneck'
import { Circle } from '../math/Circle.js'
import { Segment } from '../math/Segment.js'
import { Vector2 } from '../math/Vector2.js'
import { IBall } from './IBall.js'
import { ILives } from './IScore.js'
import { IWinZone } from './IWinZone.js'

export class TPS_MANAGER {
	public tickCount: number = 0
	public tickLimiter: Bottleneck

	constructor(public TPS: number) {
		this.tickLimiter = new Bottleneck({
			minTime: 1000 / TPS,
			maxConcurrent: 1
		})
	}
}

export enum GameState {
	Paused,
	Started
}

export const BALL_SPEED = 0.6

export class GameEngine {
	private _currentState: GameState = GameState.Paused
	private _TPS_DATA: TPS_MANAGER
	private _tickTimer: ReturnType<typeof setInterval> | null = null
	private _ball: IBall = {
		shape: new Circle(new Vector2(), 0.8),
		velo: this.getRandomVelo()
	}
	private readonly PAUSE_TICKS_AFTER_POINT = 120
	private _pauseTicksRemaining: number = this.PAUSE_TICKS_AFTER_POINT
	public startTime

	public constructor(
		TPS: number,
		private _live: ILives,
		private _borders: Segment[],
		private _winZones: IWinZone[]
	) {
		this._TPS_DATA = new TPS_MANAGER(TPS)
		this.startTime = Date.now()
	}

	private getRandomVelo(): Vector2 {
		const x = Math.random() < 0.5 ? 1 : -1
		const y = (Math.random() - 0.5) * 1.4
		return new Vector2(x, y).normalize()
	}

	private _startGame(): void {
		if (this._currentState === GameState.Started) return
		this._currentState = GameState.Started
		this.startTickLoop()
	}

	private _pauseGame(): void {
		this._currentState = GameState.Paused
		if (this._tickTimer !== null) {
			clearInterval(this?._tickTimer)
			this._tickTimer = null
		}
	}

	public setState(gameState: GameState): void {
		switch (gameState) {
			case GameState.Started:
				this._startGame()
				break
			case GameState.Paused:
				this._pauseGame()
				break
		}
	}

	private checkWin(seg: Segment): boolean {
		for (const w of this._winZones) {
			if (w.seg === seg) {
				--this._live[`p${w.player as 1 | 2}`]
				return true
			}
		}
		return false
	}

	private checkColision(): boolean {
		for (const border of this._borders) {
			const hitData = border.intersect(this._ball.shape)
			if (Array.isArray(hitData) && hitData.length > 0) {
				if (this.checkWin(border)) {
					return true
				}

				const velo: Vector2 = Vector2.reflect(
					this._ball.velo,
					border.getNormal()
				)
				this._ball.velo = velo
				return false
			}
		}
		return false
	}

	private playTick(): void {
		if (this._currentState != GameState.Started) {
			return
		}

		// Handle pause between points
		if (this._pauseTicksRemaining > 0) {
			--this._pauseTicksRemaining
			++this._TPS_DATA.tickCount
			return
		}

		// TP failsafe
		if (Vector2.squaredDist(this._ball.shape.pos, new Vector2()) > 4096) {
			console.warn(`ball to far away: ${this._ball.shape.pos}`)
			this._ball.shape.origin = new Vector2()
			this._ball.velo = this.getRandomVelo()
		}

		if (!this.checkColision()) {
			const movement = this._ball.velo.clone().multiply(BALL_SPEED)
			this._ball.shape.pos.add(movement)
		} else {
			this._ball.shape.pos.setXY(0, 0)
			this._ball.velo = this.getRandomVelo()
			this._pauseTicksRemaining = this.PAUSE_TICKS_AFTER_POINT
			console.log(`[${this._live.p1} | ${this._live.p2}]`)
		}

		++this._TPS_DATA.tickCount
		if (this.lives.p1 <= 0 || this.lives.p2 <= 0) {
			this._pauseGame()
		}
	}

	private async startTickLoop(): Promise<void> {
		while (this._currentState === GameState.Started) {
			try {
				await this._TPS_DATA.tickLimiter.schedule(async () => {
					this.playTick()
				})
			} catch (err) {
				console.error('Error during tick execution:', err)
			}
		}
	}

	get syncedTimeMs(): number {
		return Date.now()
	}
	get state(): GameState {
		return this._currentState
	}

	get tickCount(): number {
		return this._TPS_DATA.tickCount
	}

	get ball(): IBall {
		return this._ball
	}

	get borders(): Segment[] {
		return this._borders
	}

	get lives(): ILives {
		return this._live
	}

	get pauseTicksRemaining(): number {
		return this._pauseTicksRemaining
	}
}
