import {
	PublicUserAuthDTO,
	PublicUserListAuthDTO
} from '@ft_transcendence/common'
import {
	listPublicUsers,
	findPublicUserById,
	deleteUserById,
	changeUserPassword
} from '../repositories/userRepository.js'
import createHttpError from 'http-errors'

export function listPublicUsersUsecase(): PublicUserListAuthDTO {
	const result = listPublicUsers()
	if (!result) throw createHttpError.InternalServerError('Failed to list users')
	return result
}

export function getPublicUserUsecase(userId: number): PublicUserAuthDTO {
	const user = findPublicUserById(userId)
	if (!user) throw createHttpError.NotFound('User not found')
	return user
}

export function deleteUserUsecase(userId: number): void {
	const ok = deleteUserById(userId)
	if (!ok) throw createHttpError.NotFound('User not found')
}

export function changeUserPasswordUsecase(
	userId: number,
	hashedPassword: string
): void {
	const ok = changeUserPassword(userId, hashedPassword)
	if (!ok) throw createHttpError.NotFound('User not found')
	return
}
