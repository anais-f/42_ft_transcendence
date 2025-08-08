import { PhysicsEngine } from "./physics-engine"

class TPS_MANAGER {
    public TPS: number
    public TPS_INTERVAL_MS: number
    public previousTime_MS: number = 0

    constructor(TPS: number) {
        this.TPS = TPS
        this.TPS_INTERVAL_MS = 1000 / TPS
    }
}


export enum GameState { Paused, Started }
export class GameEngine {
    private isClientSide: boolean
    private offset: number = 0
    private physicsEngine: PhysicsEngine
    private currentState: GameState = GameState.Paused
    private TPS_DATA: TPS_MANAGER
    private tickTimer: ReturnType<typeof setInterval> | null = null

    constructor(physicsEngine: PhysicsEngine, TPS: number) {
        this.physicsEngine = physicsEngine
        this.TPS_DATA = new TPS_MANAGER(TPS)
        this.isClientSide = (typeof performance !== "undefined" && typeof performance.now === "function")

        if (this.isClientSide) {
            this.offset = Date.now() - performance.now();
        }
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
            case GameState.Started: this.startGame(); break
            case GameState.Paused: this.pauseGame(); break
        }
    }

    private startTickLoop() {
        const tickInterval = this.TPS_DATA.TPS_INTERVAL_MS
        this.tickTimer = this.scheduleTick((now: number) => {
            if (this.currentState !== GameState.Started) {
                return
            }
            this.physicsEngine.playTick()
            this.TPS_DATA.previousTime_MS = now
        }, tickInterval)
    }

    public getSyncedTimeMs(): number {
        if (this.isClientSide) {
            return performance.now() + this.offset;
        }
        return Date.now();
    }

    protected getTimeMs(): number {
        if (typeof performance !== "undefined" && performance.now) {
            return performance.now()
        }
        return Date.now()
    }

    private scheduleTick(fn: (now: number) => void, intervalMs: number): ReturnType<typeof setInterval> {
        return setInterval(() => fn(this.getTimeMs()), intervalMs)
    }
}

