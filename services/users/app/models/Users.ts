/**
 * User model
 * Represents a user in the system
 * Used in the database and in the codebase
 */
export interface User {
	id_user: number
	avatar: string
	status: number // 0 = offline, 1 = online
	last_connection: string // ISO timestamp
}

/**
 * Types for specific user fields
 * Used in function parameters and return types
 */
export type UserId = Pick<User, 'id_user'>
export type UserStatus = Pick<User, 'id_user' | 'status'>
export type UserConnection = Pick<User, 'id_user' | 'last_connection'>
export type UserAvatar = Pick<User, 'id_user' | 'avatar'>
