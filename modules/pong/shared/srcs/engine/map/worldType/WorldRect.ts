import { Vector2 } from "../../../math/Vector2"
import { Segment } from "../../../math/Segment"
import { Circle } from "../../../math/shapes/Circle"
import { Polygon } from "../../../math/shapes/Polygon"
import { PongMap } from "../Map"
import { World, WorldShape } from "../World"
import { Rectangle } from "../../../math/shapes/Rectangle"

// TODO: unit test
export class WorldRect extends World {
    private rect: Rectangle = new Rectangle(new Vector2(-20, -10), new Vector2(40, 20))

    public constructor() {
        // TODO: add pads shape
        super(WorldShape.Rectangle, new PongMap()) // empty map
    }

    public isInside(o: Vector2): boolean
    public isInside(o: Segment): boolean
    public isInside(o: Circle): boolean
    public isInside(o: Polygon): boolean

    public isInside(o: Vector2 | Segment | Circle | Polygon): boolean {
        if (o instanceof Vector2) { 
            return this.isInsideVec2(o)
        } else if (o instanceof Segment) {
            return this.isInsideSeg(o)
        } else if (o instanceof Circle) {
            return this.isInsideCircle(o)
        } else if (o instanceof Polygon) {
            return this.isInsidePolygon(o)
        }
        throw "Invalid type"
    }

    private isInsideVec2(o: Vector2): boolean {
        return this.rect.containsPoint(o)
    }
    private isInsideSeg(o: Segment): boolean {
        return this.isInsideVec2(o.getP1()) && this.isInsideVec2(o.getP2())
    }

    private isInsideCircle(o: Circle) {
        const center = o.getPos();
        const rad = o.getRad();

        const minX = this.rect.getSegment()[0].getP1().getX(); // origin.x
        const minY = this.rect.getSegment()[0].getP1().getY(); // origin.y
        const maxX = this.rect.getSegment()[1].getP1().getX(); // topRight.x
        const maxY = this.rect.getSegment()[2].getP1().getY(); // bottomRight.y
        return (
            center.getX() - rad >= minX &&
                center.getX() + rad <= maxX &&
                center.getY() - rad >= minY &&
                center.getY() + rad <= maxY
        )
    }
        

    private isInsidePolygon(o: Polygon) {
        for (const s of o.getSegment()) {
            if (!this.rect.containsPoint(s.getP1())) {
                return false
            }
        }
        return true
    }
}
