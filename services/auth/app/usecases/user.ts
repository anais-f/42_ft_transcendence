import {
	listPublicUsers,
	findPublicUserById,
	findPublicUserByUsername,
} from '../repositories/userRepository.js'

export function getPublicUsers() {
	return listPublicUsers()
}

export function getPublicUser(id: number) {
	return findPublicUserById(id)
}

export function getPublicUserByUsername(username: string) {
	return findPublicUserByUsername(username)
}
