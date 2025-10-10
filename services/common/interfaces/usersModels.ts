/**
 * Interface representing a user row in the database
 * Contains sensitive information like password
 * Used internally in the auth service
 */
export interface IUserRow {
	id_user: number
	username: string
	password: string
}

export type IPublicUser = Omit<IUserRow, 'password'>


/**
 * Comprehensive user model for application use
 * Combines database fields and additional status info
 * Used across various services
 */
export interface IFullUser {
	id_user: number
	username: string
	avatar: string
	status: number // 0 = offline, 1 = online
	last_connection: string // ISO timestamp
}

/**
 * Types for specific user fields
 * Used in function parameters and return types
 */
export type IUserId = Pick<IFullUser, 'id_user'>
export type IUserStatus = Pick<IFullUser, 'id_user' | 'status'>
export type IUserConnection = Pick<IFullUser, 'id_user' | 'last_connection'>
export type IUserAvatar = Pick<IFullUser, 'id_user' | 'avatar'>
export type IPublicPageUser = Pick<IFullUser, 'id_user' | 'username' | 'avatar'>
export type IFriendPageUser = Pick<IFullUser, 'id_user' | 'username' | 'avatar' | 'status' | 'last_connection'>


