class TournamentStore {
	private tournaments: Map<string, Tournament>

	constructor() {
		this.tournaments = new Map()
	}
}

export const tournamentStore = new TournamentStore()
