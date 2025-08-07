export class Vector2 {
	// init class fields
	private x:number
	private y:number

	constructor(x:number = 0, y:number = 0) {
		this.x = x
		this.y = y
	}

	// getters
	public getX():number { return this.x }
	public getY():number { return this.y }

	// setter
	public setX(newX:number) { this.x = newX }
	public setY(newY:number) { this.y = newY }
	public setXY(newX:number, newY:number) { this.x = newX; this.y = newY }

	// operator
	static subtract(v1: Vector2, v2: Vector2): Vector2 {
		return new Vector2(
			v1.getX() - v2.getX(),
			v1.getY() - v2.getY()
		)
	}

	static add(v1: Vector2, v2: Vector2): Vector2 {
		return new Vector2(
			v1.getX() + v2.getX(),
			v1.getY() + v2.getY()
		)
	}

	static dot(v1: Vector2, v2:Vector2): number {
		return v1.getX() * v2.getX() + v1.getY() * v2.getY()
	}

	static cross(v1: Vector2, v2: Vector2): number {
		return v1.getX() * v2.getY() - v1.getY() * v2.getX()
	}

	static magnitude(v: Vector2): number {
		return Math.sqrt(Vector2.dot(v, v))
	}

	static normalize(v: Vector2): Vector2 {
		const length: number = Vector2.magnitude(v)

		if (0 === length) {
			return new Vector2(0,0)
		}

		return new Vector2(
			v.getX() / length,
			v.getY() / length
		)
	}

	static negate(v: Vector2): Vector2 {
		return new Vector2(
			-v.getX(),
			-v.getY()
		)
	}

	static multiply(v:Vector2, scalar: number): Vector2 {
		return new Vector2(v.getX() * scalar, v.getY() * scalar)
	}

	static squaredDist(v1: Vector2, v2: Vector2): number {
		return (v1.getX() - v2.getX())**2 + (v1.getY() - v2.getY())**2
	}

	static dist(v1: Vector2, v2: Vector2): number {
		return Math.sqrt(Vector2.squaredDist(v1, v2))
	}

	squaredDist(v2: Vector2): number {
		return Vector2.squaredDist(this, v2)
	}

	dist(v2: Vector2): number {
		return Vector2.dist(this, v2)
	}

	add(v2: Vector2): Vector2 {
		const result = Vector2.add(this, v2)
		this.x = result.getX()
		this.y = result.getY()
		return this
	}

	subtract(v2: Vector2): Vector2 {
		const result = Vector2.subtract(this, v2)
		this.x = result.getX()
		this.y = result.getY()
		return this
	}

	squaredLength(): number {
		return Vector2.dot(this, this)
	}

	magnitude(): number {
		return Vector2.magnitude(this)
	}

	normalize(): Vector2 {
		const result = Vector2.normalize(this)
		this.x = result.getX()
		this.y = result.getY()
		return this
	}

	negate(): Vector2 {
		const result = Vector2.negate(this)
		this.x = result.getX()
		this.y = result.getY()
		return this
	}

	cross(v2: Vector2): number {
		return Vector2.cross(this, v2)
	}

	multiply(scalar: number) {
		const result = Vector2.multiply(this, scalar)
		this.x = result.getX()
		this.y = result.getY()
		return this
	}
	
}


