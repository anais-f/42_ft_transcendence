import { z } from 'zod'

export const IdParamSchema = z.object({
	id: z.string().regex(/^[1-9]\d*$/, 'Invalid id')
})

export const CodeParamSchema = z.object({
	code: z.string().regex(/^[TG]-[A-Z0-9]{5}$/, 'Invalid code')
})

export type IdParamDTO = z.infer<typeof IdParamSchema>
export type CodeParamDTO = z.infer<typeof CodeParamSchema>
