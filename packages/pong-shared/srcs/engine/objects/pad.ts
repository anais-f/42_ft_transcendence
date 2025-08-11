import { PongObject } from "./PongObject";

export class pad {
    private player: number
    private obj: PongObject
    public constructor(player: number, obj: PongObject) {
        this.player = player
        this.obj = obj
    }

    getPlayer(): number {
        return this.player
    }

    getObjs(): PongObject {
        return this.obj
    }
}
