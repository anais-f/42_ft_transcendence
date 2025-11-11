import { z } from 'zod'

export const verify2FASchema = z
	.object({
		twofa_code: z.string().min(6).max(6).regex(/^\d{6}$/, '2FA code must be a 6-digit number')
	})
	.strict()

export type Verify2FADTO = z.infer<typeof verify2FASchema>