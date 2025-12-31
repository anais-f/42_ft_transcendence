export type PlayerSlot = 'p1' | 'p2'

export interface PlayerData {
  id?: number
	username: string
	avatar: string
}

export type OnOpponentJoinCallback = (opponent: PlayerData) => void
