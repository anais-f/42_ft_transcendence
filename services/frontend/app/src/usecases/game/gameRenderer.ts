import { Segment, Vector2 } from '@ft_transcendence/pong-shared'
import { gameStore } from '../gameStore.js'

class GameRenderer {
	private segments: Segment[] = []
	private ballPos: Vector2 = new Vector2(0, 0)
	private ballVelo: Vector2 = new Vector2(0, 0)
	private ballFactor: number = 1
	private lastBallUpdate: number = 0
	private canvas: HTMLCanvasElement | null = null
	private ctx: CanvasRenderingContext2D | null = null
	private animationId: number | null = null

	setCanvas(canvas: HTMLCanvasElement): void {
		this.canvas = canvas
		this.ctx = canvas.getContext('2d')
		this.startAnimation()
	}

	setSegments(segments: Segment[]): void {
		this.segments = segments
	}

	setBallState(pos: Vector2, velo: Vector2, factor: number): void {
		this.ballPos = pos
		this.ballVelo = velo
		this.ballFactor = factor
		this.lastBallUpdate = performance.now()
	}

	private startAnimation(): void {
		if (this.animationId !== null) return

		const animate = () => {
			this.render()
			this.animationId = requestAnimationFrame(animate)
		}
		this.animationId = requestAnimationFrame(animate)
	}

	private stopAnimation(): void {
		if (this.animationId !== null) {
			cancelAnimationFrame(this.animationId)
			this.animationId = null
		}
	}

	private getPredictedBallPos(): Vector2 {
		const now = performance.now()
		const dt = (now - this.lastBallUpdate) / 1000
		return new Vector2(
			this.ballPos.getX() + this.ballVelo.getX() * this.ballFactor * dt,
			this.ballPos.getY() + this.ballVelo.getY() * this.ballFactor * dt
		)
	}

	private render(): void {
		if (!this.ctx || !this.canvas) return

		const ctx = this.ctx
		const width = this.canvas.width
		const height = this.canvas.height

		ctx.clearRect(0, 0, width, height)

		const scaleX = width / 40
		const scaleY = height / 20
		const offsetX = width / 2
		const offsetY = height / 2

		const flipX = gameStore.playerSlot === 'p2' ? -1 : 1
		const toCanvasX = (x: number) => offsetX + x * flipX * scaleX
		const toCanvasY = (y: number) => offsetY - y * scaleY

		ctx.strokeStyle = 'black'
		ctx.lineWidth = 5
		for (const seg of this.segments) {
			const p1 = seg.getP1()
			const p2 = seg.getP2()
			ctx.beginPath()
			ctx.moveTo(toCanvasX(p1.getX()), toCanvasY(p1.getY()))
			ctx.lineTo(toCanvasX(p2.getX()), toCanvasY(p2.getY()))
			ctx.stroke()
		}

		const predictedPos = this.getPredictedBallPos()
		ctx.fillStyle = 'black'
		ctx.beginPath()
		ctx.arc(
			toCanvasX(predictedPos.getX()),
			toCanvasY(predictedPos.getY()),
			0.5 * scaleX,
			0,
			Math.PI * 2
		)
		ctx.fill()
	}

	clear(): void {
		this.stopAnimation()
		this.segments = []
		this.ballPos = new Vector2(0, 0)
		this.ballVelo = new Vector2(0, 0)
		this.ballFactor = 1
		this.lastBallUpdate = 0
		this.canvas = null
		this.ctx = null
	}
}

export const gameRenderer = new GameRenderer()
