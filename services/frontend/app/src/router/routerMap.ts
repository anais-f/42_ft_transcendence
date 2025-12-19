import {
	attachGameEvents,
	detachGameEvents,
	GamePage
} from '../pages/GamePage.js'
import {
	HomePage,
	attachHomeEvents,
	detachHomeEvents
} from '../pages/oldhome.js'
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
import { HomeBisPage } from '../pages/HomePage.js'
import { ProfilePage } from '../pages/ProfilePage.js'
import {
	LobbyPage,
	attachLobbyEvents,
	detachLobbyEvents
} from '../pages/LobbyPage.js'

export type Pages =
	| 'home'
	| 'game'
	| 'lobby'
	| 'login'
	| 'profile'
	| 'settings'
	| 'test'

export type Route = {
	id: string
	url: string
	page: () => string
	binds?: Array<() => void>
	unbinds?: Array<() => void>
	public?: boolean
}

export const routerMap: Record<Pages, Route> = {
	home: {
		id: 'home',
		url: '/',
		page: HomePage,
		binds: [attachHomeEvents],
		unbinds: [detachHomeEvents]
	},

	game: {
		id: 'game',
		url: '/play',
		page: GamePage,
		binds: [attachGameEvents],
		unbinds: [detachGameEvents]
	},

	lobby: {
		id: 'lobby',
		url: '/lobby/:code',
		page: LobbyPage,
		binds: [attachLobbyEvents],
		unbinds: [detachLobbyEvents]
	},

	login: {
		id: 'login',
		url: '/login',
		page: LoginPage,
		binds: [attachLoginEvents],
		unbinds: [detachLoginEvents, cleanupGoogleAuth],
		public: true
	},

	profile: {
		id: 'profile',
		url: '/profile',
		page: ProfilePage
	},

	settings: {
		id: 'settings',
		url: '/settings',
		page: SettingsPage,
		binds: [attachSettingsEvents],
		unbinds: [detachSettingsEvents]
	},

	test: {
		id: 'test',
		url: '/test',
		page: HomeBisPage,
		binds: [],
		unbinds: [],
		public: true
	}
}
