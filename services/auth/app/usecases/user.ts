import { listPublicUsers, findPublicUserById } from '../repositories/userRepository.js'

export function getPublicUsers() {
	return listPublicUsers()
}

export function getPublicUser(id: number) {
	return findPublicUserById(id)
}
