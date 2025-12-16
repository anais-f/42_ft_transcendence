import {
	HomePage,
	attachHomeEvents,
	detachHomeEvents
} from '../pages/oldhome.js'
import {
	attachGameEvents,
	detachGameEvents,
	GamePage
} from '../pages/oldgame.js'
import {
	attachLobbyEvents,
	detachLobbyEvents,
	LobbyPage
} from '../pages/oldlobby.js'
import {
	LoginPage,
	attachLoginEvents,
	detachLoginEvents,
	cleanupGoogleAuth
} from '../pages/oldlogin.js'
import { ProfilePage } from '../pages/oldprofile.js'
import {
	SettingsPage,
	attachSettingsEvents,
	detachSettingsEvents
} from '../pages/oldsettings.js'
import { TestPage } from '../pages/LoginPage.js'

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
		page: TestPage
	}
}
