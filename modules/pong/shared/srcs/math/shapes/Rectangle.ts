import { Vector2 } from "../Vector2"
import { Polygon } from "./Polygon";

//TODO : add function for:
// 	  const center = o.getPos();
//    const rad = o.getRad();
//    const minX = this.rect.getSegment()[0].getP1().getX(); // origin.x
//    const minY = this.rect.getSegment()[0].getP1().getY(); // origin.y
//    const maxX = this.rect.getSegment()[1].getP1().getX(); // topRight.x
//    const maxY = this.rect.getSegment()[2].getP1().getY(); // bottomRight.y
export class Rectangle extends Polygon {
	constructor(origin: Vector2, dimensions: Vector2) {
		const topRight = new Vector2(origin.getX() + dimensions.getX(), origin.getY());
		const bottomLeft = new Vector2(origin.getX(), origin.getY() + dimensions.getY());
		const bottomRight = new Vector2(origin.getX() + dimensions.getX(), origin.getY() + dimensions.getY());

		super([origin, topRight, bottomRight, bottomLeft]);
	}
}


