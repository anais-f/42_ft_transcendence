import {bindLogOutButton, HomePage, unbindLogOutButton} from "../pages/oldhome";
import {GamePage} from "../pages/oldgame";
import {LobbyPage} from "../pages/oldlobby";
import {bindLoginForm, bindRegisterForm, LoginPage, unbindLoginForm, unbindRegisterForm} from "../pages/oldlogin";
import {ProfilePage} from "../pages/oldprofile";
import {SettingsPage} from "../pages/oldsettings";

export type Pages = 'home' | 'game' | 'lobby' | 'login' | 'profile' | 'settings'

export type Route = {
  id: string
  url: string
  page: () => string
  binds?: Array<() => void>
  unbinds?: Array<() => void>
  public?: boolean
}

export const routerMap = Record<Pages, Route> = {
  home: {
    id: 'home',
    url: '/',
    page: HomePage,
    binds: [bindLogOutButton],
    unbinds: [unbindLogOutButton]
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