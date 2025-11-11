import { getDb } from '../database/connection.js'

const db = () => getDb()

export function upsertPendingSecret(userId: number, secretEnc: string, pendingUntil: number): void {
  const stmt = db().prepare(`INSERT INTO twofa_secrets(user_id, secret_enc, active, pending_until)
    VALUES(?, ?, 0, ?)
    ON CONFLICT(user_id) DO UPDATE SET secret_enc=excluded.secret_enc, active=0, pending_until=excluded.pending_until`)
  stmt.run(userId, secretEnc, pendingUntil)
}

export function activateSecret(userId: number): boolean {
  const stmt = db().prepare('UPDATE twofa_secrets SET active=1, pending_until=NULL WHERE user_id=?')
  const info = stmt.run(userId)
  return info.changes > 0
}

export function deleteSecret(userId: number): boolean {
  const stmt = db().prepare('DELETE FROM twofa_secrets WHERE user_id=?')
  const info = stmt.run(userId)
  return info.changes > 0
}

export function getSecretEnc(userId: number): string | null {
  const stmt = db().prepare('SELECT secret_enc FROM twofa_secrets WHERE user_id=? AND active=1')
  const row = stmt.get(userId) as { secret_enc: string } | undefined
  return row ? row.secret_enc : null
}

export function getPendingSecretEnc(userId: number): { secret_enc: string, pending_until: number } | null {
  const stmt = db().prepare('SELECT secret_enc, pending_until FROM twofa_secrets WHERE user_id=? AND active=0')
  const row = stmt.get(userId) as { secret_enc: string, pending_until: number } | undefined
  return row ? row : null
}
