import { z } from 'zod'

export const wsQuerySchema = z.object({
  token: z.string().min(1, 'Token is required')
})
