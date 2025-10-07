import argon2, { argon2id } from 'argon2'

export async function hashPassword(password: string) {
	return argon2.hash(password, {
		type: argon2id,
		memoryCost: 65536,
		timeCost: 2,
		parallelism: 1
	})
}

export async function verifyPassword(hash: string, password: string) {
	return argon2.verify(hash, password)
}
