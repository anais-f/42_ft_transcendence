import { Vector2 } from "../Vector2"
import { Polygon } from "./Polygon";

export class Rectangle extends Polygon {
	constructor(origin: Vector2, dimensions: Vector2) {
		const topRight = new Vector2(origin.getX() + dimensions.getX(), origin.getY());
		const bottomLeft = new Vector2(origin.getX(), origin.getY() + dimensions.getY());
		const bottomRight = new Vector2(origin.getX() + dimensions.getX(), origin.getY() + dimensions.getY());

		super([origin, topRight, bottomRight, bottomLeft]);
	}
}


