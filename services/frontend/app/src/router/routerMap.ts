import {
	attachGameEvents,
	detachGameEvents,
	GamePage
} from '../pages/GamePage.js'
import {
	LoginPage,
	attachLoginEvents,
	detachLoginEvents,
	cleanupGoogleAuth
} from '../pages/LoginPage.js'
import {
	SettingsPage,
	attachSettingsEvents,
	detachSettingsEvents
} from '../pages/SettingsPage.js'
import {
	HomePage,
	attachHomeEvents,
	detachHomeEvents
} from '../pages/HomePage.js'
import {
	ProfilePage,
	attachProfileEvents,
	detachProfileEvents
} from '../pages/ProfilePage.js'
import {
	TournamentPage,
} from '../pages/TournamentPage.js'

import {
	LobbyPage,
	attachLobbyEvents,
	detachLobbyEvents
} from '../pages/LobbyPage.js'

export type Pages = 'home' | 'game' | 'lobby' | 'login' | 'profile' | 'settings' | 'tournament'

export type Route = {
	id: string
	url: string
	page: () => string
	binds?: Array<() => void>
	unbinds?: Array<() => void>
	public?: boolean
	index: number
}

export const routerMap: Record<Pages, Route> = {
	home: {
		id: 'home',
		url: '/',
		page: HomePage,
		binds: [attachHomeEvents],
		unbinds: [detachHomeEvents],
		index: 2
	},

	game: {
		id: 'game',
		url: '/play',
		page: GamePage,
		binds: [attachGameEvents],
		unbinds: [detachGameEvents],
		index: 6
	},

	lobby: {
		id: 'lobby',
		url: '/lobby/:code',
		page: LobbyPage,
		binds: [attachLobbyEvents],
		unbinds: [detachLobbyEvents],
		index: 5
	},

	login: {
		id: 'login',
		url: '/login',
		page: LoginPage,
		binds: [attachLoginEvents],
		unbinds: [detachLoginEvents, cleanupGoogleAuth],
		public: true,
		index: 1
	},

	profile: {
		id: 'profile',
		url: '/profile/:id',
		page: ProfilePage,
		binds: [attachProfileEvents],
		unbinds: [detachProfileEvents],
		index: 3
	},

	settings: {
		id: 'settings',
		url: '/settings',
		page: SettingsPage,
		binds: [attachSettingsEvents],
		unbinds: [detachSettingsEvents],
		index: 4
	},
	tournament: {
		id: 'tournament',
		url: '/tournament',
		page: TournamentPage,
		index: 5
	}
}
