import { PhysicsEngine } from './physics-engine.js'

export class TPS_MANAGER {
	public TPS_INTERVAL_MS: number
	public previousTime_MS: number = 0

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
	public	packets: Uint8Array[] = []
	public startTime

	constructor(
		private physicsEngine: PhysicsEngine,
		TPS: number
	) {
		this.TPS_DATA = new TPS_MANAGER(TPS)
		this.startTime = Date.now()
	}

	private startGame() {
		if (this.currentState === GameState.Started) return
		this.currentState = GameState.Started
		this.TPS_DATA.previousTime_MS = this.getTimeMs()
		this.startTickLoop()
	}

	private pauseGame() {
		this.currentState = GameState.Paused
		if (this.tickTimer !== null) {
			clearInterval(this?.tickTimer)
			this.tickTimer = null
		}
	}

	public setState(gameState: GameState) {
		switch (gameState) {
			case GameState.Started:
				this.startGame()
				break
			case GameState.Paused:
				this.pauseGame()
				break
		}
	}

	private playTick() {
		this.physicsEngine.playTick()
		console.log(`[${(Date.now() / 1000).toFixed(2)}]\t[${(this.TPS_DATA.previousTime_MS / 1000).toFixed(2)}]`)
//		const _C01: C01Move
//		const _C03: C03BallBase


	}

	private startTickLoop() {
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

	protected getTimeMs(): number {
		return Date.now()
	}

	private scheduleTick(
		fn: (now: number) => void,
		intervalMs: number
	): ReturnType<typeof setInterval> {
		return setInterval(() => fn(this.getTimeMs()), intervalMs)
	}

	public getState(): GameState {
		return this.currentState
	}
}
