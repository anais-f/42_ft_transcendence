import { Segment, Vector2 } from '@ft_transcendence/pong-shared'
import { gameStore } from '../../usecases/gameStore.js'
import {
	SEGMENT_LINE_WIDTH,
	SEGMENT_COLOR,
	BALL_COLOR,
	BALL_RADIUS_SCALE,
	COUNTDOWN_FONT,
	COUNTDOWN_COLOR,
	GAME_SPACE_WIDTH,
	GAME_SPACE_HEIGHT
} from '../constants.js'

class Renderer {
	private segments: Segment[] = []
	private ballPos: Vector2 = new Vector2(0, 0)
	private ballVelo: Vector2 = new Vector2(0, 0)
	private ballFactor: number = 1
	private lastBallUpdate: number = 0
	private canvas: HTMLCanvasElement | null = null
	private ctx: CanvasRenderingContext2D | null = null
	private animationId: number | null = null
	private countdown: number | null = null

	setCanvas(canvas: HTMLCanvasElement): void {
		this.canvas = canvas
		this.ctx = canvas.getContext('2d')
		this.startAnimation()
	}

	setSegments(segments: Segment[]): void {
		this.segments = segments
	}

	setBallPos(pos: Vector2): void {
		this.ballPos = pos
		this.lastBallUpdate = performance.now()
	}

	setBallState(pos: Vector2, velo: Vector2, factor: number): void {
		this.ballPos = pos
		this.ballVelo = velo
		this.ballFactor = factor
		this.lastBallUpdate = performance.now()
	}

	setCountdown(value: number | null): void {
		this.countdown = value
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
			this.ballPos.x + this.ballVelo.x * this.ballFactor * dt,
			this.ballPos.y + this.ballVelo.y * this.ballFactor * dt
		)
	}

	private render(): void {
		if (!this.ctx || !this.canvas) return

		const ctx = this.ctx
		const width = this.canvas.width
		const height = this.canvas.height

		ctx.clearRect(0, 0, width, height)

		const scaleX = width / GAME_SPACE_WIDTH
		const scaleY = height / GAME_SPACE_HEIGHT
		const offsetX = width / 2
		const offsetY = height / 2

		const flipX = gameStore.playerSlot === 'p2' ? -1 : 1
		const toCanvasX = (x: number) => offsetX + x * flipX * scaleX
		const toCanvasY = (y: number) => offsetY - y * scaleY

		ctx.strokeStyle = SEGMENT_COLOR
		ctx.lineWidth = SEGMENT_LINE_WIDTH
		for (const seg of this.segments) {
			const p1 = seg.p1
			const p2 = seg.p2
			ctx.beginPath()
			ctx.moveTo(toCanvasX(p1.x), toCanvasY(p1.y))
			ctx.lineTo(toCanvasX(p2.x), toCanvasY(p2.y))
			ctx.stroke()
		}

		const predictedPos = this.getPredictedBallPos()
		ctx.fillStyle = BALL_COLOR
		ctx.beginPath()
		ctx.arc(
			toCanvasX(predictedPos.x),
			toCanvasY(predictedPos.y),
			BALL_RADIUS_SCALE * scaleX,
			0,
			Math.PI * 2
		)
		ctx.fill()

		if (this.countdown !== null && this.countdown > 0) {
			ctx.fillStyle = COUNTDOWN_COLOR
			ctx.font = COUNTDOWN_FONT
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'
			ctx.strokeText(this.countdown.toString(), width / 2, height / 3)
		}
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
		this.countdown = null
	}
}

export const renderer = new Renderer()
