import { z } from 'zod'

/**
  These schemas validate incoming requests.
  They can be used in Fastify routes as follows:
  app.post('/user/status', { schema: { body: UserStatusSchema } }, (req, res) => { ... })
 */
// export const UserIdSchema = z.object({
// 	id_user: z.number().int().positive(),
// })
//
// export const UserStatusSchema = z.object({
// 	id_user: z.number().int().positive(),
// 	status: z.number().int().min(0).max(1), // 0 = offline, 1 = online
// })
//
// export const UserAvatarSchema = z.object({
// 	id_user: z.number().int().positive(),
// 	avatar: z.string().min(1),
// })

export const NewUserSchema = z.object({
	id_user: z.number().int().positive(),
})

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
})

export const SuccessResponseSchema = z.object({
	success: z.literal(true),
	message: z.string().optional(),
})

export const ErrorResponseSchema = z.object({
	success: z.boolean().optional(),
	error: z.string(),
})

/**
  Typescript types inferred from zod schemas
  to be used in the codebase.
  Ex: function getUser(id: number): UserResponseDTO { ... }
*/
export type UserResponseDTO = z.infer<typeof UserResponseSchema>
export type UsersListResponseDTO = z.infer<typeof UsersListResponseSchema>
export type NewUserDTO = z.infer<typeof NewUserSchema>
export type SuccessResponseDTO = z.infer<typeof SuccessResponseSchema>
export type ErrorResponseDTO = z.infer<typeof ErrorResponseSchema>
// export type UserIdDTO = z.infer<typeof UserIdSchema>
// export type UserStatusDTO = z.infer<typeof UserStatusSchema>
// export type UserAvatarDTO = z.infer<typeof UserAvatarSchema>