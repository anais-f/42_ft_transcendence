export interface IUserAuth {
	user_id: number
	login: string
	password?: string
	google_id?: string
	is_admin: boolean
}

export type IPublicUserAuth = Omit<
	IUserAuth,
	'is_admin' | 'password' | 'google_id'
>

export interface IPrivateUser {
	user_id: number
	username: string
	avatar: string
	status: UserStatus
	last_connection: string
	two_fa_enabled?: boolean
	is_google_user?: boolean
}

export type IUserId = Pick<IPrivateUser, 'user_id'>
export type IUsername = Pick<IPrivateUser, 'username'>
export type IUsernameId = Pick<IPrivateUser, 'user_id' | 'username'>
export type IUserStatus = Pick<IPrivateUser, 'user_id' | 'status'>
export type IUserConnection = Pick<IPrivateUser, 'user_id' | 'last_connection'>
export type IUserAvatar = Pick<IPrivateUser, 'user_id' | 'avatar'>
export type IPublicProfileUser = Pick<
	IPrivateUser,
	'user_id' | 'username' | 'avatar' | 'status' | 'last_connection'
>

export enum UserStatus {
	OFFLINE = 0,
	ONLINE = 1
}

export enum RelationStatus {
	PENDING = 0,
	FRIENDS = 1
}
