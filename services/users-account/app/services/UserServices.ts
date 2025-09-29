// logique métier
/*

    Contiennent la logique métier, les règles métier.

    Appellent les repositories pour la persistence.

    Peuvent appeler d’autres services ou API externes (ex: webhook).

    Ex: UserService.createUser(), UserService.importUsersFromAuth().

 */

import fetch from 'node-fetch';


// TODO: faire la validation de schema response avec zod

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
    // await UsersRepository.insertUsers(data.users);



  }
}