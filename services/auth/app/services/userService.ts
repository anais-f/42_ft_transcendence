import { listUsers, findUserById } from '../repositories/userRepository.js'

export function getUsers() {
  return listUsers()
}

export function getUser(id: number) {
  return findUserById(id)
}