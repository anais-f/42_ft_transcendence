import {
	listPublicUsers,
	findPublicUserById,
	findPublicUserByLogin
} from '../repositories/userRepository.js'

export function getPublicUsers() {
	return listPublicUsers()
}

export function getPublicUser(id: number) {
	return findPublicUserById(id)
}

export function getPublicUserByLogin(login: string) {
	return findPublicUserByLogin(login)
}
