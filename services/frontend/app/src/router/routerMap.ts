import { HomePage, attachHomeEvents } from '../pages/oldhome.js'
import {
	GamePage,
	attachGameEvents,
	cleanupGameEvents
} from '../pages/oldgame.js'
import {
	LobbyPage,
	attachLobbyEvents,
	cleanupLobbyEvents
} from '../pages/oldlobby.js'
import {
	LoginPage,
	attachLoginEvents,
	cleanupGoogleAuth
} from '../pages/oldlogin.js'
import { ProfilePage } from '../pages/oldprofile.js'
import { SettingsPage } from '../pages/oldsettings.js'
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
		binds: [attachHomeEvents]
	},

	game: {
		id: 'game',
		url: '/play',
		page: GamePage,
		binds: [attachGameEvents],
		unbinds: [cleanupGameEvents]
	},

	lobby: {
		id: 'lobby',
		url: '/lobby/:code',
		page: LobbyPage,
		binds: [attachLobbyEvents],
		unbinds: [cleanupLobbyEvents]
	},

	login: {
		id: 'login',
		url: '/login',
		page: LoginPage,
		binds: [attachLoginEvents],
		unbinds: [cleanupGoogleAuth],
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
		page: SettingsPage
	},

	test: {
		id: 'test',
		url: '/test',
		page: TestPage
	}
}
