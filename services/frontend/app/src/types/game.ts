export type PlayerSlot = 'p1' | 'p2'

export interface PlayerData {
	username: string
	avatar: string
}

export type OnOpponentJoinCallback = (opponent: PlayerData) => void
