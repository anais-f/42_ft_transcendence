import { z } from 'zod'

export function validateEnv<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
	const result = schema.safeParse(process.env)

	if (!result.success) {
		const errors = result.error.issues
			.map((err) => `${err.path.join('.')}(${err.code}): ${err.message}`)
			.join('\n  ')

		throw new Error(`Environment validation failed:\n  ${errors}`)
	}

	return result.data
}
