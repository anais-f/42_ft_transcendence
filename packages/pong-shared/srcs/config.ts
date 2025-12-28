export const GameConfig = {
	ball: {
		speed: 0.4,
		speedIncreaseFactor: 1.05,
		maxSpeed: 1.2,
		radius: 0.5
	},
	paddle: {
		speed: 0.3
	},
	game: {
		tps: 60,
		maxLives: 10,
		pauseTicksAfterPoint: 120,
		countdownSteps: 3,
		countdownSeconds: 5
	},
	arena: {
		width: 40,
		height: 20
	}
} as const

export const BALL_SPEED = GameConfig.ball.speed
export const SPEED_INCREASE_FACTOR = GameConfig.ball.speedIncreaseFactor
export const MAX_BALL_SPEED = GameConfig.ball.maxSpeed
export const BALL_RADIUS = GameConfig.ball.radius

export const PAD_SPEED = GameConfig.paddle.speed

export const DEFAULT_TPS = GameConfig.game.tps
export const MAX_LIVES = GameConfig.game.maxLives
export const PAUSE_TICKS_AFTER_POINT = GameConfig.game.pauseTicksAfterPoint
export const COUNTDOWN_STEPS = GameConfig.game.countdownSteps
export const COUNTDOWN_SECONDS = GameConfig.game.countdownSeconds
export const TICKS_PER_STEP = PAUSE_TICKS_AFTER_POINT / COUNTDOWN_STEPS

export const GAME_SPACE_WIDTH = GameConfig.arena.width
export const GAME_SPACE_HEIGHT = GameConfig.arena.height
