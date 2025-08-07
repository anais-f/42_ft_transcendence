import { Shape } from "../math/shapes/Shape"

enum EngineState {
	Running,
	Paused
}

export class PhysicsEngine {
    private TPS: number
    private isRunning: boolean = false
    private totalTick: number = 0
    private currentState: EngineState
    private objs: Shape[] = []

    public constructor(TPS: number) {
        this.TPS = TPS
        this.currentState = EngineState.Paused
    }

    public addObj(obj: Shape) {
        this.objs.push(obj)
    }

    public setState(state: EngineState) {
        switch (state) {
            case EngineState.Running:
                this.isRunning = true
                break
            case EngineState.Paused:
                this.isRunning = false
                break
        }
    }
}

