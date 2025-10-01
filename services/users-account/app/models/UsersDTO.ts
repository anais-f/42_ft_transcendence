/*
  zod schema validation example
 */

import { z } from 'zod'
import { User, UserId, UserStatus, UserConnection, UserAvatar } from './Users'


// Schémas pour les routes
export const UserIdSchema = z.object({
  id_user: z.number().int().positive()
});

export const UserStatusSchema = z.object({
  id_user: z.number().int().positive(),
  status: z.number().int().min(0).max(1) // 0 = offline, 1 = online
});

export const UserAvatarSchema = z.object({
  id_user: z.number().int().positive(),
  avatar: z.string().min(1)
});

export const WebhookNewUserSchema = z.object({
  id_user: z.number().int().positive(),
  username: z.string().min(3)
});


// Schémas pour les réponses
export const UserResponseSchema = z.object({
  id_user: z.number(),
  avatar: z.string(),
  status: z.number(),
  last_connection: z.string()
});

export const UsersListResponseSchema = z.object({
  users: z.array(UserResponseSchema)
});


// Types inférés
export type UserIdDTO = z.infer<typeof UserIdSchema>;
export type UserStatusDTO = z.infer<typeof UserStatusSchema>;
export type UserAvatarDTO = z.infer<typeof UserAvatarSchema>;
export type WebhookNewUserDTO = z.infer<typeof WebhookNewUserSchema>;