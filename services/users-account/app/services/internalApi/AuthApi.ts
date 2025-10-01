/*
  AuthApiClients : Client API pour interagir avec le service d'authentification
    Peuvent appeler d’autres services ou API externes (ex: webhook).
    faire des requetes sortqntes vers d'autres services
    appelle les API externes
    Ex: AuthApiClient.getUserById(), AuthApiClient.createUser().
*/

import fetch from "node-fetch";
import {UsersRepository} from "../../repositories/usersRepository.js";

export async function fetchUsersFromAuth() {
  try {
    const response = await fetch('http://auth:3000/auth/users');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // data contient un objet avec la structure attendue { users: [ { id_user: number, username: string } ] }
    // .json est une methode qui lit le corps de la reponse et le parse en JSON, pas de verif de la part de la fonction
    const data = await response.json();

    // Appel au repository pour insérer les utilisateurs en base
    await UsersRepository.insertManyUsers(data.users);
  }
  catch (error) {
    console.error('Error fetching users from auth service:', error);
  }
}