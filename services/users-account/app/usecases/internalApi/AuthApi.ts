import fetch from 'node-fetch'
import { UserIdDTO, UserAuthDTO, PublicUserListDTO, PublicUserListSchema } from '../../models/UsersDTO.js'
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
    try {
      const response = await fetch('http://localhost:3001/users')
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const raw = (await response.json()) as PublicUserListDTO
      console.log("raw:", raw)
      // if (!Array.isArray(data)) throw new Error('Invalid response shape from auth service')
      const data = PublicUserListSchema.parse(raw)
      console.log("data:", data)

      return data.users.map(u => ({ id_user: u.id_user }))
    } catch (error) {
      console.error('Error fetching users from auth service:', error)
      throw error
    }
  }

  /**
   * @description Fetch username by user ID from the auth service
   * @returns UsernameDTO
   * @throws Error if the request fails
   * @param The ID of the user to fetch the username for
   */
  static async getUsernameById(id: UserId): Promise<string> {
    try {
      const response = await fetch(`http://localhost:3001/users/${id.id_user}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = (await response.json()) as UserAuthDTO
      if (!data || typeof data.username !== 'string')
        throw new Error('Invalid response shape from auth service')

      return data.username
    } catch (error) {
      console.error('Error fetching username from auth service:', error)
      throw error
    }
  }
}
