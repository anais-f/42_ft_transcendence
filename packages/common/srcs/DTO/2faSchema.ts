import { z } from 'zod'

export const verify2FASchema = z
	.object({
		user_id: z.number().int().positive(),
		twofa_code: z.string().min(6).max(6).regex(/^\d{6}$/, '2FA code must be a 6-digit number')
	})
	.strict()

export const setup2FASchema = z
	.object({
		user_id: z.number().int().positive(),
		issuer: z.string(),
		label: z.string()
	})
	.strict()

export const disable2FASchema = z
	.object({
		user_id: z.number().int().positive()
	})
	.strict()
	
export const status2FASchema = z
	.object({
		user_id: z.number().int().positive()
	})
	.strict()

export type Verify2FADTO = z.infer<typeof verify2FASchema>
export type Setup2FADTO = z.infer<typeof setup2FASchema>
export type Disable2FADTO = z.infer<typeof disable2FASchema>
export type Status2FADTO = z.infer<typeof status2FASchema>
