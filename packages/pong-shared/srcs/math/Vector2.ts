import { EPSILON } from '../define.js'

export class Vector2 {
	// init class fields
	private _x: number
	private _y: number

	constructor(x: number = 0, y: number = 0) {
		this._x = x
		this._y = y
	}

	// getters
	get x(): number {
		return this._x
	}
	get y(): number {
		return this._y
	}

	// setters
	set x(newX: number) {
		this._x = newX
	}
	set y(newY: number) {
		this._y = newY
	}

	setXY(newX: number, newY: number) {
		this._x = newX
		this._y = newY
	}

	// operator
	public static subtract(v1: Vector2, v2: Vector2): Vector2 {
		return new Vector2(v1.x - v2.x, v1.y - v2.y)
	}

	public static add(v1: Vector2, v2: Vector2): Vector2 {
		return new Vector2(v1.x + v2.x, v1.y + v2.y)
	}

	public static dot(v1: Vector2, v2: Vector2): number {
		return v1.x * v2.x + v1.y * v2.y
	}

	public static cross(v1: Vector2, v2: Vector2): number {
		return v1.x * v2.y - v1.y * v2.x
	}

	public static magnitude(v: Vector2): number {
		return Math.sqrt(Vector2.dot(v, v))
	}

	public static normalize(v: Vector2): Vector2 {
		const length: number = Vector2.magnitude(v)

		if (0 === length) {
			return new Vector2()
		}

		return new Vector2(v.x / length, v.y / length)
	}

	public static negate(v: Vector2): Vector2 {
		return new Vector2(-v.x, -v.y)
	}

	public static multiply(v: Vector2, scalar: number): Vector2 {
		return new Vector2(v.x * scalar, v.y * scalar)
	}

	public static squaredDist(v1: Vector2, v2: Vector2): number {
		return (v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2
	}

	public static dist(v1: Vector2, v2: Vector2): number {
		return Math.sqrt(Vector2.squaredDist(v1, v2))
	}

	public static clone(v: Vector2): Vector2 {
		return v.clone()
	}

	public clone(): Vector2 {
		return new Vector2(this.x, this.y)
	}

	public squaredDist(v2: Vector2): number {
		return Vector2.squaredDist(this, v2)
	}

	public dist(v2: Vector2): number {
		return Vector2.dist(this, v2)
	}

	public add(v2: Vector2): Vector2 {
		const result = Vector2.add(this, v2)
		this.x = result.x
		this.y = result.y
		return this
	}

	public subtract(v2: Vector2): Vector2 {
		const result = Vector2.subtract(this, v2)
		this.x = result.x
		this.y = result.y
		return this
	}

	public squaredLength(): number {
		return Vector2.dot(this, this)
	}

	public magnitude(): number {
		return Vector2.magnitude(this)
	}

	public normalize(): Vector2 {
		const result = Vector2.normalize(this)
		this.x = result.x
		this.y = result.y
		return this
	}

	public negate(): Vector2 {
		const result = Vector2.negate(this)
		this.x = result.x
		this.y = result.y
		return this
	}

	public cross(v2: Vector2): number {
		return Vector2.cross(this, v2)
	}

	public multiply(scalar: number) {
		const result = Vector2.multiply(this, scalar)
		this.x = result.x
		this.y = result.y
		return this
	}

	public static reflect(v: Vector2, normal: Vector2): Vector2 {
		const dot = this.dot(v, normal)
		return new Vector2(v.x - 2 * dot * normal.x, v.y - 2 * dot * normal.y)
	}

	public reflect(normal: Vector2): Vector2 {
		return Vector2.reflect(this, normal)
	}

	public equals(other: Vector2): boolean {
		return Vector2.equals(this, other)
	}

	public static equals(v1: Vector2, v2: Vector2): boolean {
		return Math.abs(v1.x - v2.x) < EPSILON && Math.abs(v1.y - v2.y) < EPSILON
	}

	public static min(v1: Vector2, v2: Vector2): Vector2 {
		return new Vector2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y))
	}

	public static max(v1: Vector2, v2: Vector2): Vector2 {
		return new Vector2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y))
	}

	public serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(16)
		const view = new DataView(buff)

		view.setFloat64(0, this.x, true)
		view.setFloat64(8, this.y, true)

		return buff
	}
}
