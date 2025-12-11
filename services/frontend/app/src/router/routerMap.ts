import {
	bindLogOutButton,
	bindCreateButton,
	bindJoinLobbyForm,
	HomePage,
	unbindLogOutButton,
	unbindCreateButton,
	unbindJoinLobbyForm
} from '../pages/oldhome.js'
import { GamePage } from '../pages/oldgame.js'
import { LobbyPage, bindLobbyPage, unbindLobbyPage } from '../pages/oldlobby.js'
import {
	bindLoginForm,
	bindRegisterForm,
	LoginPage,
	unbindLoginForm,
	unbindRegisterForm
} from '../pages/oldlogin.js'
import { ProfilePage } from '../pages/oldprofile.js'
import { SettingsPage } from '../pages/oldsettings.js'

export type Pages = 'home' | 'game' | 'lobby' | 'login' | 'profile' | 'settings'

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
		binds: [bindLogOutButton, bindCreateButton, bindJoinLobbyForm],
		unbinds: [unbindLogOutButton, unbindCreateButton, unbindJoinLobbyForm]
	},

	game: {
		id: 'game',
		url: '/game',
		page: GamePage
	},

	lobby: {
		id: 'lobby',
		url: '/lobby/:code',
		page: LobbyPage,
		binds: [bindLobbyPage],
		unbinds: [unbindLobbyPage]
	},

	login: {
		id: 'login',
		url: '/login',
		page: LoginPage,
		binds: [bindRegisterForm, bindLoginForm],
		unbinds: [unbindRegisterForm, unbindLoginForm],
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
	}
}
