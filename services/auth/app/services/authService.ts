import { createUser, findUserByUsername } from '../repositories/userRepository.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signToken } from '../utils/jwt.js'

export async function registerUser(username: string, password: string) {
  const hashed = await hashPassword(password)
  createUser(username, hashed)
  return { success: true }
}

export async function loginUser(username: string, password: string) {
  const user = findUserByUsername(username)
  if (!user) return null
  const ok = await verifyPassword(user.password, password)
  if (!ok) return null
  return { token: signToken({ userId: user.id, username: user.username }) }
}