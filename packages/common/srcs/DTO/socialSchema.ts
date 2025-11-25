import { z } from 'zod'


export const FriendsListSchema = z.object({
  userIds: z.array(z.number().int().positive())
})

export const FriendsListResponseSchema = z.object({
  friends: z.array(
      z.object({
        user_id: z.number(),
        login: z.string(),
        status: z.number().int().nonnegative(),
        last_connection: z.string()
      })
  )
})

