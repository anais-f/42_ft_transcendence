import fetch from 'node-fetch'
import { UserAuthDTO, PublicUserListDTO, PublicUserListSchema } from '../../models/UsersDTO.js'
import {UserId} from "../../models/Users.js"

// TODO: pouvoir changer le username -> call avec l'auth pour la modif -> internalApi
// TODO: pouvoir changer le mot de passe -> call avec l'auth pour la modif -> internalApi
// TODO: gérer les erreurs (try/catch) + logger


export class AuthApi {
  /**
   * @description Fetch all users from the auth service
   * @returns Array of users with id_user and username
   * @throws Error if the request fails
   */
  static async getAllUsers() {
    const response = await fetch('http://localhost:3001/users')
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const raw = (await response.json()) as PublicUserListDTO
    const parsed = PublicUserListSchema.safeParse(raw)
    if (!parsed.success) throw new Error('Invalid response shape from auth service: ' + parsed.error.message)

    return parsed.data.users.map(u => ({ id_user: u.id_user }))
  }

  /**
   * @description Fetch username by user ID from the auth service
   * @returns UsernameDTO
   * @throws Error if the request fails
   * @param id The ID of the user to fetch the username for
   */
  static async getUsernameById(id: UserId): Promise<string> {
    const response = await fetch(`http://localhost:3001/users/${id.id_user}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = (await response.json()) as UserAuthDTO
    if (!data || typeof data.username !== 'string')
      throw new Error('Invalid response shape from auth service')

    return data.username
  }
}
