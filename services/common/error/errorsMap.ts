export const ERRORS = {
  INVALID_INPUT: { status: 400, message: 'Invalid input' },
  MISSING_FIELD: { status: 400, message: 'Missing field' },
  UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
  FORBIDDEN: { status: 403, message: 'Forbidden' },
  NOT_FOUND: { status: 404, message: 'Not found' },
  CONFLICT: { status: 409, message: 'Conflict' },
  DUPLICATE_ENTRY: { status: 409, message: 'Duplicate entry' },
  DB_QUERY: { status: 500, message: 'Database query error' },
  DB_CONNECTION: { status: 500, message: 'Database connection error' },
  DB_TIMEOUT: { status: 500, message: 'Database timeout' },
  EXTERNAL_ERROR: { status: 502, message: 'External service error' },
  INTERNAL: { status: 500, message: 'Internal server error' },
} as const

export const SUCCESS = {
  USER_CREATED: { status: 200, message: 'User created successfully' },
  USER_UPDATED: { status: 200, message: 'User updated successfully' },
  USER_DELETED: { status: 200, message: 'User deleted successfully' },
  LOGIN_SUCCESS: { status: 200, message: 'Login successful' },
  LOGOUT_SUCCESS: { status: 200, message: 'Logout successful' },
  PASSWORD_CHANGED: { status: 200, message: 'Password changed successfully' },
  PROFILE_UPDATED: { status: 200, message: 'Profile updated successfully' },
  FRIEND_REQUEST_SENT: { status: 200, message: 'Friend request sent' },
  FRIEND_REQUEST_ACCEPTED: { status: 200, message: 'Friend request accepted' },
  FRIEND_REMOVED: { status: 200, message: 'Friend removed' },
  GAME_STARTED: { status: 200, message: 'Game started successfully' },
  GAME_ENDED: { status: 200, message: 'Game ended successfully' }
} as const

export function mapSqliteError(e: any): keyof typeof ERRORS {
  if (e.code === 'SQLITE_CONSTRAINT') {
    if (e.message.includes('UNIQUE constraint failed'))
      return 'DUPLICATE_ENTRY'
    return 'CONFLICT';
  }
  if (e.code === 'SQLITE_BUSY')
    return 'DB_TIMEOUT';
  if (e.code === 'SQLITE_MISUSE')
    return 'DB_QUERY';
  return 'INTERNAL';
}

export type Result<T> = | { success: true; data: T } | { success: false; error: string; status?: number }

export function ok<T>(data: T): Result<T> {
  return { success: true, data }
}

export function err<T = never>(code: keyof typeof ERRORS): Result<T> {
  const e = ERRORS[code]
  return { success: false, error: e.message, status: e.status }
}
