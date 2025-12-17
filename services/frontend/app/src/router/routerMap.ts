import {
	HomePage,
	attachHomeEvents,
	detachHomeEvents
} from '../pages/oldhome.js'
import { GamePage } from '../pages/oldgame.js'
import { LobbyPage } from '../pages/oldlobby.js'
import { ProfilePage } from '../pages/oldprofile.js'
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
		url: '/game',
		page: GamePage
	},

	lobby: {
		id: 'lobby',
		url: '/lobby',
		page: LobbyPage
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
		page: SettingsPage,
		binds: [attachSettingsEvents],
		unbinds: [detachSettingsEvents],
		public: true
	}
}
