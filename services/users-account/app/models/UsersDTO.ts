import { z } from 'zod'

/**
  These schemas validate incoming requests.
  They can be used in Fastify routes as follows:
  app.post('/user/status', { schema: { body: UserStatusSchema } }, (req, res) => { ... })
 */
export const UserIdSchema = z.object({
	id_user: z.number().int().positive(),
}).strict()

// TODO : reprendre le schéma de l'auth -> DTO commun in progress
export const UserAuthSchema = z.object({
  id_user: z.number().int().positive(),
  username: z.string().min(3).max(30),
}).strict()

/**
 * These schemas validate outgoing responses.
 * They can be used in Fastify routes as follows:
 * app.get('/user/:id', { schema: { response: { 200: UserResponseSchema } } }, (req, res) => { ... })
 */
export const UserResponseSchema = z.object({
	id_user: z.number(),
	avatar: z.string(),
	status: z.number(),
	last_connection: z.string(),
})

export const UsersListResponseSchema = z.object({
	users: z.array(UserResponseSchema),
}).strict()

export const SuccessResponseSchema = z.object({
	success: z.literal(true),
	message: z.string().optional(),
}).strict()

export const ErrorResponseSchema = z.object({
	success: z.boolean().optional(),
	error: z.string(),
}).strict()

/**
  Typescript types inferred from zod schemas
  to be used in the codebase.
  Ex: function getUser(id: number): UserResponseDTO { ... }
*/
export type UserResponseDTO = z.infer<typeof UserResponseSchema>
export type UsersListResponseDTO = z.infer<typeof UsersListResponseSchema>
export type UserIdDTO = z.infer<typeof UserIdSchema>
export type UserAuthDTO = z.infer<typeof UserAuthSchema>
export type SuccessResponseDTO = z.infer<typeof SuccessResponseSchema>
export type ErrorResponseDTO = z.infer<typeof ErrorResponseSchema>
// export type UserIdDTO = z.infer<typeof UserIdSchema>
// export type UserStatusDTO = z.infer<typeof UserStatusSchema>
// export type UserAvatarDTO = z.infer<typeof UserAvatarSchema>
