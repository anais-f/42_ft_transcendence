import Bottleneck from 'bottleneck'
import { Circle } from '../math/Circle.js'
import { Segment } from '../math/Segment.js'
import { Vector2 } from '../math/Vector2.js'
import { IBall } from './IBall.js'
import { IScore } from './IScore.js'
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
	private currentState: GameState = GameState.Paused
	private TPS_DATA: TPS_MANAGER
	private tickTimer: ReturnType<typeof setInterval> | null = null
	private ball: IBall = {
		shape: new Circle(new Vector2(), 0.8),
		velo: this.getRandomVelo()
	}
	private pauseTicksRemaining: number = 0
	private readonly PAUSE_TICKS_AFTER_POINT = 120
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

	private getRandomVelo(): Vector2 {
		const x = Math.random() < 0.5 ? 1 : -1
		const y = (Math.random() - 0.5) * 1.4
		return new Vector2(x, y).normalize()
	}

	private _startGame(): void {
		if (this.currentState === GameState.Started) return
		this.currentState = GameState.Started
		this.startTickLoop()
	}

	private _pauseGame(): void {
		this.currentState = GameState.Paused
		if (this.tickTimer !== null) {
			clearInterval(this?.tickTimer)
			this.tickTimer = null
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
		for (const w of this.winZones) {
			if (w.seg === seg) {
				++this.score[`p${w.player as 1 | 2}`]
				return true
			}
		}
		return false
	}

	private checkColision(): boolean {
		for (const border of this.borders) {
			const hitData = border.intersect(this.ball.shape)
			if (Array.isArray(hitData) && hitData.length > 0) {
				if (this.checkWin(border)) {
					return true
				}

				const velo: Vector2 = Vector2.reflect(
					this.ball.velo,
					border.getNormal()
				)
				this.ball.velo = velo
				return false
			}
		}
		return false
	}

	private playTick(): void {
		if (this.currentState != GameState.Started) {
			return
		}

		// Handle pause between points
		if (this.pauseTicksRemaining > 0) {
			--this.pauseTicksRemaining
			++this.TPS_DATA.tickCount
			return
		}

		// TP failsafe
		if (Vector2.squaredDist(this.ball.shape.getPos(), new Vector2()) > 4096) {
			console.warn(`ball to far away: ${this.ball.shape.getPos()}`)
			this.ball.shape.setOrigin(new Vector2())
			this.ball.velo = this.getRandomVelo()
		}

		if (!this.checkColision()) {
			const movement = this.ball.velo.clone().multiply(BALL_SPEED)
			this.ball.shape.getPos().add(movement)
		} else {
			this.ball.shape.getPos().setXY(0, 0)
			this.ball.velo = this.getRandomVelo()
			this.pauseTicksRemaining = this.PAUSE_TICKS_AFTER_POINT
			console.log(`[${this.score.p1} | ${this.score.p2}]`)
		}

		++this.TPS_DATA.tickCount
		if (this.score.p1 + this.score.p2 >= this.score.max) {
			this._pauseGame()
		}
	}

	private async startTickLoop(): Promise<void> {
		while (this.currentState === GameState.Started) {
			try {
				await this.TPS_DATA.tickLimiter.schedule(async () => {
					this.playTick()
				})
			} catch (err) {
				console.error('Error during tick execution:', err)
			}
		}
	}

	public getSyncedTimeMs(): number {
		return Date.now()
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

	public getScore(): IScore {
		return this.score
	}

	public getPauseTicksRemaining(): number {
		return this.pauseTicksRemaining
	}
}
