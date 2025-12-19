import Bottleneck from 'bottleneck'
import { Circle } from '../math/Circle.js'
import { Segment } from '../math/Segment.js'
import { Vector2 } from '../math/Vector2.js'
import { IBall } from './IBall.js'
import { ILives } from './IScore.js'
import { IWinZone } from './IWinZone.js'
import { EPSILON } from '../define.js'

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

export const BALL_SPEED = 0.4

export class GameEngine {
	private _deadTick = false
	private _currentState: GameState = GameState.Paused
	private _TPS_DATA: TPS_MANAGER
	private _dynamicBorderVelocities: Map<Segment, Vector2> = new Map()
	private _ball: IBall = {
		shape: new Circle(new Vector2(), 0.5),
		velo: this.getRandomVelo()
	}
	private readonly PAUSE_TICKS_AFTER_POINT = 120
	private _pauseTicksRemaining: number = this.PAUSE_TICKS_AFTER_POINT
	public startTime

	public constructor(
		TPS: number,
		private _live: ILives,
		private _staticBorders: Segment[],
		private _dynamicBorders: Segment[],
		private _winZones: IWinZone[],
		private _maxLives: number = 10
	) {
		this._TPS_DATA = new TPS_MANAGER(TPS)
		this.startTime = Date.now()
	}

	private getRandomVelo(): Vector2 {
		const x = Math.random() < 0.5 ? 1 : -1
		const y = (Math.random() - 0.5) * 1.4
		const velo = new Vector2(x, y).normalize()

		let dir
		if (this.lives.p1 > this.lives.p2) {
			dir = new Vector2(1, 0)
		} else if (this.lives.p1 < this.lives.p2) {
			dir = new Vector2(-1, 0)
		} else {
			dir = Math.random() < 0.5 ? new Vector2(1, 0) : new Vector2(-1, 0)
		}

		return Vector2.dot(velo, dir) < 0 ? velo : velo.negate()
	}

	private _startGame(): void {
		if (this._currentState === GameState.Started) return
		this._currentState = GameState.Started
	}

	private _pauseGame(): void {
		this._currentState = GameState.Paused
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

	private getCollisionNormal(
		border: Segment,
		hitPoints: Vector2[],
		borderVelocity: Vector2 = new Vector2(0, 0)
	): Vector2 | null {
		const ballCenter = this._ball.shape.pos

		const relativeVelo = Vector2.subtract(this._ball.velo, borderVelocity)

		const closestHit = border.closestPointToPoint(ballCenter)
		const segNormal = border.getNormal()

		const dotVeloNormal = Vector2.dot(relativeVelo, segNormal)
		if (Math.abs(dotVeloNormal) < EPSILON) {
			const altNormal = Vector2.subtract(ballCenter, closestHit).normalize()
			if (Vector2.dot(relativeVelo, altNormal) >= 0) {
				return null
			}
			return altNormal
		}

		const toBall = Vector2.subtract(ballCenter, closestHit)
		const orientedNormal =
			Vector2.dot(toBall, segNormal) >= 0 ? segNormal : segNormal.negate()

		if (Vector2.dot(relativeVelo, orientedNormal) >= 0) {
			return null
		}

		if (hitPoints.length === 1) {
			const pointNormal = Vector2.subtract(ballCenter, hitPoints[0]).normalize()
			if (Vector2.dot(relativeVelo, pointNormal) >= 0) {
				return null
			}
			return pointNormal
		}

		return orientedNormal
	}

	private checkColision(): boolean {
		interface CollisionData {
			border: Segment
			normal: Vector2
		}

		const collisions: CollisionData[] = []
		const allBorders = [...this._staticBorders, ...this._dynamicBorders]

		for (const border of allBorders) {
			const hitData = border.intersect(this._ball.shape)
			if (Array.isArray(hitData) && hitData.length > 0) {
				const borderVelocity = this.getDynamicBorderVelocity(border)
				const normal = this.getCollisionNormal(border, hitData, borderVelocity)
				if (normal) {
					collisions.push({ border, normal })
				}
			}
		}

		if (collisions.length === 0) {
			return false
		}

		for (const collision of collisions) {
			if (this.checkWin(collision.border)) {
				return true
			}
		}

		let combinedNormal = new Vector2(0, 0)
		for (const collision of collisions) {
			combinedNormal.add(collision.normal)
		}
		combinedNormal.normalize()

		this._ball.velo = Vector2.reflect(this._ball.velo, combinedNormal)
		return false
	}

	private checkSweptCollision(): boolean {
		interface SweptCollisionData {
			border: Segment
			t: number
			normal: Vector2
		}

		const movement = this._ball.velo.clone().multiply(BALL_SPEED)
		const startPos = this._ball.shape.pos.clone()
		const endPos = Vector2.add(startPos, movement)
		const radius = this._ball.shape.rad

		const allBorders = [...this._staticBorders, ...this._dynamicBorders]
		const sweptCollisions: SweptCollisionData[] = []

		for (const border of allBorders) {
			const t = border.intersectSweptCircle(startPos, endPos, radius)
			if (t !== null) {
				const collisionPos = Vector2.add(
					startPos,
					Vector2.multiply(movement, t)
				)

				const closestPoint = border.closestPointToPoint(collisionPos)
				const toCenter = Vector2.subtract(collisionPos, closestPoint)
				const normal =
					toCenter.magnitude() > EPSILON
						? toCenter.normalize()
						: border.getNormal()

				const borderVelocity = this.getDynamicBorderVelocity(border)
				const relativeVelo = Vector2.subtract(this._ball.velo, borderVelocity)

				if (Vector2.dot(relativeVelo, normal) < 0) {
					sweptCollisions.push({ border, t, normal })
				}
			}
		}

		if (sweptCollisions.length === 0) {
			this._ball.shape.pos.add(movement)
			return false
		}

		sweptCollisions.sort((a, b) => a.t - b.t)
		const firstCollision = sweptCollisions[0]

		if (this.checkWin(firstCollision.border)) {
			return true
		}

		const safeT = Math.max(0, firstCollision.t - 0.01)
		const moveToCollision = Vector2.multiply(movement, safeT)
		this._ball.shape.pos.add(moveToCollision)

		this._ball.velo = Vector2.reflect(this._ball.velo, firstCollision.normal)

		return false
	}

	public playTick(): void {
		if (this._currentState != GameState.Started) {
			return
		}

		if (this._deadTick === true && this._pauseTicksRemaining === 0) {
			this._pauseGame()
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

		if (this.checkColision() || this.checkSweptCollision()) {
			this._ball.shape.pos.setXY(0, 0)
			this._ball.velo = this.getRandomVelo()
			this._pauseTicksRemaining = this.PAUSE_TICKS_AFTER_POINT
			console.log(`[${this._live.p1} | ${this._live.p2}]`)
		}

		++this._TPS_DATA.tickCount
		if (this.lives.p1 <= 0 || this.lives.p2 <= 0) {
			this._deadTick = true
		}
	}

	public setDynamicBorderVelocity(seg: Segment, velocity: Vector2): void {
		this._dynamicBorderVelocities.set(seg, velocity)
	}

	public clearDynamicBorderVelocities(): void {
		this._dynamicBorderVelocities.clear()
	}

	private getDynamicBorderVelocity(seg: Segment): Vector2 {
		return this._dynamicBorderVelocities.get(seg) ?? new Vector2(0, 0)
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
		return [...this._staticBorders, ...this._dynamicBorders]
	}

	get staticBorders(): Segment[] {
		return this._staticBorders
	}

	get dynamicBorders(): Segment[] {
		return this._dynamicBorders
	}

	get lives(): ILives {
		return this._live
	}

	get maxLives(): number {
		return this._maxLives
	}

	get pauseTicksRemaining(): number {
		return this._pauseTicksRemaining
	}

	get deadTick(): boolean {
		return this._deadTick
	}
}
