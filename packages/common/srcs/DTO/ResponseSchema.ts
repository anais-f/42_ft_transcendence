import { z } from 'zod'

export const SuccessResponseSchema = z.object({
	success: z.literal(true),
	message: z.string().optional()
})

export const ErrorResponseSchema = z
	.object({
		success: z.boolean(),
		error: z.string()
	})
	.strict()
