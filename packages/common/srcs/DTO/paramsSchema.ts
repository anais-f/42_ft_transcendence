import { z } from 'zod'

export const IdParamSchema = z.object({
	id: z.string().regex(/^[1-9]\d*$/, 'Invalid id')
})

export const CodeParamSchema = z.object({
	code: z
		.string()
		.regex(/^[TG]-[A-Z0-9]{5}$/, 'Invalid code')
		.meta({
			description: 'The unique game code returned from the `new-game` endpoint',
			example: 'G-ABCDE'
		})
})

export type IdParamDTO = z.infer<typeof IdParamSchema>
export type CodeParamDTO = z.infer<typeof CodeParamSchema>
