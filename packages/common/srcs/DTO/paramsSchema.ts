import { z } from 'zod'

export const IdParamSchema = z.object({ id: z.string().regex(/^[1-9]\d*$/, 'Invalid id') })

export type IdParamDTO = z.infer<typeof IdParamSchema>
