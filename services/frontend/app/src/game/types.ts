// Player role in game
export type PlayerSlot = 'p1' | 'p2'

// Player data
export interface PlayerData {
	username: string
	avatar: string
}

// Callback when opponent joins game
export type OnOpponentJoinCallback = (opponent: PlayerData) => void

// Renderer state
export interface RendererState {
	segments: any[]
	ballPos: any
	ballVelo: any
	ballFactor: number
	lastBallUpdate: number
	countdown: number | null
}
