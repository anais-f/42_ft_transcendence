import { Segment } from "../../math/Segment"
import { Circle } from "../../math/shapes/Circle"
import { Polygon } from "../../math/shapes/Polygon"
import { Vector2 } from "../../math/Vector2"
import { PongMap } from "./Map"

export enum WorldShape { Rectangle }

export class World {
    private shape: WorldShape
    private map: PongMap

    protected constructor(ws: WorldShape, map: PongMap) {
        this.shape = ws
        this.map = map
    }

    public getShape() {
        return this.shape
    }

    public getObjs() {
        return this.map.getObjs()
    }

    
    // Vec2, Segment, Polygon, Circle
    public isInside(o: Vector2): boolean
    public isInside(o: Segment): boolean
    public isInside(o: Circle): boolean
    public isInside(o: Polygon): boolean

    public isInside(o: Vector2 | Segment | Circle | Polygon): boolean {
        if (o instanceof Vector2) { 
        } else if (o instanceof Segment) {
        } else if (o instanceof Circle) {
        } else if (o instanceof Polygon) {
        }
        throw "Invalid type"
    }
}
