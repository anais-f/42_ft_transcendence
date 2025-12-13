import { HomePage, attachHomeEvents } from '../pages/oldhome'
import { GamePage } from '../pages/oldgame'
import { LobbyPage } from '../pages/oldlobby'
import {
	LoginPage,
	attachLoginEvents,
	cleanupGoogleAuth
} from '../pages/oldlogin'
import { ProfilePage } from '../pages/oldprofile'
import { SettingsPage, attachSettingsEvents } from '../pages/oldsettings'
import { TestPage } from '../pages/LoginPage'

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
		page: SettingsPage,
    binds: [attachSettingsEvents]
	},

	test: {
		id: 'test',
		url: '/test',
		page: TestPage
	}
}
