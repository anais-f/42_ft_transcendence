import { z } from 'zod'

export const SuccessResponseSchema = z.object({
	success: z.literal(true),
	message: z.string().optional(),
  data: z.any().optional()
})

export const ErrorResponseSchema = z
	.object({
		success: z.boolean().optional(),
		error: z.string()
	})
	.strict()
