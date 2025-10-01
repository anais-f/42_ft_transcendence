// structure de données interne et externes
/*

    Définitions des structures de données (TypeScript interfaces/classes).

    Représentations des entités métier.
*/

// import { z } from 'zod';

export interface User {
  id_user: number
  avatar: string
  status: number // 0 = offline, 1 = online
  last_connection: string // ISO timestamp
}

export type UserId = Pick<User, 'id_user'>
export type UserStatus = Pick<User, 'id_user' | 'status'>
export type UserConnection = Pick<User, 'id_user' | 'last_connection'>
export type UserAvatar = Pick<User, 'id_user' | 'avatar'>


