import { z } from 'zod'

export const verify2FASchema = z
	.object({
		user_id: z.number().int().positive(),
		twofa_code: z
			.string()
			.min(6)
			.max(6)
			.regex(/^\d{6}$/, '2FA code must be a 6-digit number')
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

export const twofaCodeSchema = z
	.object({
		twofa_code: z
			.string()
			.min(6)
			.max(6)
			.regex(/^\d{6}$/, '2FA code must be a 6-digit number')
	})
	.strict()

export const setup2FAResponseSchema = z
	.object({
		otpauth_url: z.string().url(),
		qr_base64: z.string(),
		expires_at: z.string()
	})
	.strict()
	.meta({
		description: 'Successfully generated 2FA setup data with QR code'
	})

export const verify2FAResponseSchema = z
	.object({
		success: z.boolean(),
		activated: z.boolean()
	})
	.strict()
	.meta({
		description: 'Verification result with success and activation status'
	})

export const disable2FAResponseSchema = z
	.object({
		success: z.boolean()
	})
	.strict()
	.meta({
		description: '2FA successfully disabled for the user'
	})

export const status2FAResponseSchema = z
	.object({
		enabled: z.boolean()
	})
	.strict()
	.meta({
		description: 'Current 2FA status for the user'
	})

export const Call2FAResponseSchema = z
	.object({
		ok: z.boolean(),
		status: z.number().int().positive(),
		data: z.unknown()
	})
	.strict()

export const Enable2FAResponseSchema = z
	.object({
		otpauth_url: z.url(),
		qr_base64: z.string(),
		expires_at: z.string()
	})
	.strict()

export const Verify2FALoginResponseSchema = z
	.object({
		auth_token: z.string()
	})
	.strict()

export type Verify2FADTO = z.infer<typeof verify2FASchema>
export type Setup2FADTO = z.infer<typeof setup2FASchema>
export type Disable2FADTO = z.infer<typeof disable2FASchema>
export type Status2FADTO = z.infer<typeof status2FASchema>
export type TwoFACodeDTO = z.infer<typeof twofaCodeSchema>
export type Setup2FAResponseDTO = z.infer<typeof setup2FAResponseSchema>
export type Verify2FAResponseDTO = z.infer<typeof verify2FAResponseSchema>
export type Disable2FAResponseDTO = z.infer<typeof disable2FAResponseSchema>
export type Status2FAResponseDTO = z.infer<typeof status2FAResponseSchema>
export type Call2FAResponseDTO = z.infer<typeof Call2FAResponseSchema>
export type Enable2FAResponseDTO = z.infer<typeof Enable2FAResponseSchema>
export type Verify2FALoginResponseDTO = z.infer<
	typeof Verify2FALoginResponseSchema
>
