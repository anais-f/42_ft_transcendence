import { z } from 'zod'

export const createTokenSchema = z
	.object({
		wsToken: z.string().min(1),
		expiresIn: z.number().int().nonnegative().meta({ deprecated: true })
	})
	.meta({ description: 'returns a jwt token for the session' })
