/*
  AuthApiClients : Client API pour interagir avec le service d'authentification
    Peuvent appeler d’autres services ou API externes (ex: webhook).
    faire des requetes sortqntes vers d'autres services
    appelle les API externes
    Ex: AuthApiClient.getUserById(), AuthApiClient.createUser().
*/

// TODO: pouvoir changer le username -> call avec l'auth pour la modif -> internalApi
// TODO: get username (from auth service) -> internalApi
// TODO: get all users avec le username (from auth service) -> internalApi partiellement

import fetch from 'node-fetch'

export class AuthApi {
	static async getAllUsers(): Promise<{ id_user: number }[]> {
		try {
			const response = await fetch('http://localhost:3001/auth/users')
			if (!response.ok)
				throw new Error(`HTTP error! status: ${response.status}`)

			const data = (await response.json()) as { users: { id_user: number }[] }

			return data.users
		} catch (error) {
			console.error('Error fetching users from auth service:', error)
			throw error
		}
	}

  // auth/users/:id -> get username
  // renvoi l'id et le username'

}

// ✅ Récupérer tous les users du service auth
// static async getAllUsers(): Promise<{ id_user: number, username: string }[]> {
//   const response = await fetch('http://auth:3000/auth/users');
//   const data = await response.json();
//   return data.users;
// }
//
// // ✅ Récupérer le username d'un user spécifique
// static async getUsernameById(id_user: number): Promise<string> {
//   const response = await fetch(`http://auth:3000/auth/users/${id_user}`);
//   const data = await response.json();
//   return data.username;
// }

// // ✅ Notifier le service auth d'un changement
// static async notifyUserStatusChange(id_user: number, status: number): Promise<void> {
//   await fetch(`http://auth:3000/auth/users/${id_user}/status`, {
//     method: 'POST',
//     body: JSON.stringify({ status }),
//     headers: { 'Content-Type': 'application/json' }
//   });
// }
