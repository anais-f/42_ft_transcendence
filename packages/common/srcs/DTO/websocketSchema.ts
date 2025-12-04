import { z } from 'zod'

export const createTokenSchema = z
	.object({
		wsToken: z.string().min(1),
		expiresIn: z.number().int().nonnegative()
	})
	.meta({ description: 'WebSocket temporary JWT creation schema' })
