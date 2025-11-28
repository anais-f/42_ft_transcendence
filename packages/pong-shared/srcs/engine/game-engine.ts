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

export class GameEngine {
	private currentState: GameState = GameState.Paused
	private TPS_DATA: TPS_MANAGER
	private tickTimer: ReturnType<typeof setInterval> | null = null
	private ball: IBall = {
		shape: new Circle(new Vector2(), 1.5),
		velo: this.getRandomVelo()
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

	private getRandomVelo(): Vector2 {
		let x = Math.random() < 0.5 ? 1 : -1
		let y = Math.random() * 0.25
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

		// TP failsafe
		if (Vector2.squaredDist(this.ball.shape.getPos(), new Vector2()) > 4096) {
			console.warn(`ball to far away: ${this.ball.shape.getPos()}`)
			this.ball.shape.setOrigin(new Vector2())
		}

		if (!this.checkColision()) {
			this.ball.shape.getPos().add(this.ball.velo)
		} else {
			this.ball.shape.getPos().setXY(0, 0)
			this.ball.velo = this.getRandomVelo()
			console.log(`[${this.score.p1} | ${this.score.p2}]`)
			console.log(`${this.ball.velo.getX()} : ${this.ball.velo.getY()}`)
		}

		++this.TPS_DATA.tickCount
		if (this.score.p1 + this.score.p2 >= this.score.max) {
			this._pauseGame()
		}

		console.log(
			`{${this.ball.shape.getPos().getX().toFixed(2)} : ${this.ball.shape.getPos().getY().toFixed(2)}} {${this.ball.velo.getX().toFixed(2)} : ${this.ball.velo.getY().toFixed(2)}} [${this.score.p1} | ${this.score.p2}]`
		)
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
}
