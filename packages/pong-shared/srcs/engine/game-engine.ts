import Bottleneck from 'bottleneck'
import { Circle } from '../math/Circle.js'
import { Segment } from '../math/Segment.js'
import { Vector2 } from '../math/Vector2.js'
import { IBall } from './IBall.js'
import { ILives } from './IScore.js'
import { IWinZone } from './IWinZone.js'
import { EPSILON } from '../define.js'
import { PongPad, padDirection } from './PongPad.js'
import {
	BALL_SPEED,
	SPEED_INCREASE_FACTOR,
	MAX_BALL_SPEED,
	BALL_RADIUS,
	PAUSE_TICKS_AFTER_POINT
} from '../config.js'

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

export interface PaddleInput {
	isMoving: boolean
	direction: padDirection
}

export class GameEngine {
	private _deadTick = false
	private _currentState: GameState = GameState.Paused
	private _TPS_DATA: TPS_MANAGER
	private _dynamicBorderVelocities: Map<Segment, Vector2> = new Map()
	private _ball: IBall = {
		shape: new Circle(new Vector2(), BALL_RADIUS),
		velo: this.getRandomVelo(),
		speed: BALL_SPEED
	}
	private _pauseTicksRemaining: number = PAUSE_TICKS_AFTER_POINT
	public startTime

	private _paddles: PongPad[] = []
	private _paddleInputs: PaddleInput[] = []
	private _padSpeed: number = 0

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

	public registerPaddles(paddles: PongPad[], padSpeed: number): void {
		this._paddles = paddles
		this._paddleInputs = paddles.map(() => ({
			isMoving: false,
			direction: padDirection.UP
		}))
		this._padSpeed = padSpeed
	}

	public setPaddleInput(
		padIndex: number,
		isMoving: boolean,
		direction: padDirection
	): void {
		if (padIndex >= 0 && padIndex < this._paddleInputs.length) {
			this._paddleInputs[padIndex] = { isMoving, direction }
		}
	}

	private _preparePaddleVelocities(): void {
		this.clearDynamicBorderVelocities()

		for (let i = 0; i < this._paddles.length; ++i) {
			const pad = this._paddles[i]
			const input = this._paddleInputs[i]

			const velocity = input.isMoving
				? new Vector2(0, this._padSpeed * input.direction)
				: new Vector2(0, 0)

			for (const seg of pad.segments) {
				this.setDynamicBorderVelocity(seg, velocity)
			}
		}
	}

	private _movePaddles(): void {
		for (let i = 0; i < this._paddles.length; ++i) {
			const pad = this._paddles[i]
			const input = this._paddleInputs[i]

			if (input.isMoving) {
				pad.move(input.direction, this._padSpeed)
			} else {
				pad.clearVelocity()
			}
		}
	}

	private _hasOverlap(): boolean {
		const radius = this._ball.shape.rad
		for (const border of this._dynamicBorders) {
			if (border.distanceToPoint(this._ball.shape.pos) < radius - EPSILON) {
				return true
			}
		}
		return false
	}

	get paddles(): PongPad[] {
		return this._paddles
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

	private _doSweptCollision(
		budget: number,
		useStaticPaddles: boolean
	): { scored: boolean; tUsed: number } {
		interface SweptCollisionData {
			border: Segment
			t: number
			normal: Vector2
		}

		const fullMovement = this._ball.velo.clone().multiply(this._ball.speed)
		const ballMovement = fullMovement.clone().multiply(budget)
		const startPos = this._ball.shape.pos.clone()
		const radius = this._ball.shape.rad

		const allBorders = [...this._staticBorders, ...this._dynamicBorders]
		const sweptCollisions: SweptCollisionData[] = []

		for (const border of allBorders) {
			// for sub-ticks paddles are already at final position and stationary
			const borderVelocity = useStaticPaddles
				? new Vector2(0, 0)
				: this.getDynamicBorderVelocity(border)

			const t = border.intersectSweptCircle(
				startPos,
				ballMovement,
				borderVelocity,
				radius
			)

			if (t !== null) {
				const collisionPos = Vector2.add(
					startPos,
					Vector2.multiply(ballMovement, t)
				)

				const segmentOffset = Vector2.multiply(borderVelocity, t)
				const adjustedP1 = Vector2.add(border.p1, segmentOffset)
				const adjustedP2 = Vector2.add(border.p2, segmentOffset)
				const adjustedSegment = new Segment(adjustedP1, adjustedP2)

				const closestPoint = adjustedSegment.closestPointToPoint(collisionPos)
				const toCenter = Vector2.subtract(collisionPos, closestPoint)
				const normal =
					toCenter.magnitude() > EPSILON
						? toCenter.normalize()
						: adjustedSegment.getNormal()

				const relativeVelo = Vector2.subtract(this._ball.velo, borderVelocity)
				if (Vector2.dot(relativeVelo, normal) < 0) {
					sweptCollisions.push({ border, t, normal })
				}
			}
		}

		if (sweptCollisions.length === 0) {
			this._ball.shape.pos.add(ballMovement)
			return { scored: false, tUsed: budget }
		}

		sweptCollisions.sort((a, b) => a.t - b.t)
		const firstCollision = sweptCollisions[0]

		if (this.checkWin(firstCollision.border)) {
			return { scored: true, tUsed: firstCollision.t * budget }
		}

		const safeT = Math.max(0, firstCollision.t - 0.01)
		const moveToCollision = Vector2.multiply(ballMovement, safeT)
		this._ball.shape.pos.add(moveToCollision)

		this._ball.velo = Vector2.reflect(this._ball.velo, firstCollision.normal)

		if (
			!useStaticPaddles &&
			this._dynamicBorders.includes(firstCollision.border)
		) {
			this._ball.speed = Math.min(
				this._ball.speed * SPEED_INCREASE_FACTOR,
				MAX_BALL_SPEED
			)
		}

		return { scored: false, tUsed: safeT * budget }
	}

	private _processCollisions(): boolean {
		const MAX_SUB_TICKS = 20

		// first collision pass (paddles moving)
		let result = this._doSweptCollision(1.0, false)
		if (result.scored) {
			return true
		}

		// Move paddles to final position
		let budgetRemaining = 1.0 - result.tUsed
		if (this._paddles.length > 0) {
			this._movePaddles()
		}

		// If ball is now inside a paddle simulate sub-ticks to push it out
		for (let i = 0; i < MAX_SUB_TICKS && budgetRemaining > EPSILON; i++) {
			if (!this._hasOverlap()) {
				break
			}

			// Sub-tick: paddles are now stationary at final position
			result = this._doSweptCollision(budgetRemaining, true)
			if (result.scored) {
				return true
			}

			// Failsafe if ball is stuck
			budgetRemaining -= result.tUsed
			if (result.tUsed < EPSILON) {
				this._forcePushOut()
				break
			}
		}

		return false
	}

	private _forcePushOut(): void {
		const radius = this._ball.shape.rad
		const ballPos = this._ball.shape.pos

		for (const border of this._dynamicBorders) {
			const dist = border.distanceToPoint(ballPos)
			if (dist < radius - EPSILON) {
				const closest = border.closestPointToPoint(ballPos)
				let pushDir = Vector2.subtract(ballPos, closest)

				if (pushDir.magnitude() < EPSILON) {
					pushDir = border.getNormal()
				} else {
					pushDir.normalize()
				}

				const overlap = radius - dist + 0.05
				ballPos.add(Vector2.multiply(pushDir, overlap))

				if (Vector2.dot(this._ball.velo, pushDir) < 0) {
					this._ball.velo = Vector2.reflect(this._ball.velo, pushDir)
				}
			}
		}
	}

	public playTick(): void {
		if (this._currentState != GameState.Started) {
			return
		}

		if (this._paddles.length > 0) {
			this._preparePaddleVelocities()
		}

		if (this._deadTick === true && this._pauseTicksRemaining === 0) {
			this._pauseGame()
		}
		if (this._pauseTicksRemaining > 0) {
			--this._pauseTicksRemaining
			++this._TPS_DATA.tickCount
			if (this._paddles.length > 0) {
				this._movePaddles()
			}
			return
		}

		// TP failsafe
		if (Vector2.squaredDist(this._ball.shape.pos, new Vector2()) > 4096) {
			console.warn(`ball to far away: ${this._ball.shape.pos}`)
			this._ball.shape.origin = new Vector2()
			this._ball.velo = this.getRandomVelo()
			this._ball.speed = BALL_SPEED
		}

		// Process collisions paddle movement + sub-ticks if needed
		if (this._processCollisions()) {
			this._ball.shape.pos.setXY(0, 0)
			this._ball.velo = this.getRandomVelo()
			this._ball.speed = BALL_SPEED
			this._pauseTicksRemaining = PAUSE_TICKS_AFTER_POINT
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
