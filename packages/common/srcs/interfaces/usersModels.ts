/**
 * Interface representing a user row in the database
 * Contains sensitive information like password
 * Used internally in the auth service
 */
export interface IUserAuth {
	user_id: number
	login: string
	password: string
}

export type IPublicUserAuth = Omit<IUserAuth, 'password'>


/**
 * Comprehensive user model for application use
 * Every information from users table
 * Used across various services
 */
export interface IPrivateUser {
	user_id: number
	username: string
	avatar: string
	status: number // 0 = offline, 1 = online
	last_connection: string // ISO timestamp
}

/**
 * Types for specific user fields
 * Used in function parameters and return types
 */
export type IUserId = Pick<IPrivateUser, 'user_id'>
export type IUsername = Pick<IPrivateUser, 'username'>
export type IUsernameId = Pick<IPrivateUser, 'user_id' | 'username'>
export type IUserStatus = Pick<IPrivateUser, 'user_id' | 'status'>
export type IUserConnection = Pick<IPrivateUser, 'user_id' | 'last_connection'>
export type IUserAvatar = Pick<IPrivateUser, 'user_id' | 'avatar'>
export type IPublicProfileUser = Pick<IPrivateUser, 'user_id' | 'username' | 'avatar' | 'status'>
