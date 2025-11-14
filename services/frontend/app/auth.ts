type Json = Record<string, any>

const TOKEN_KEY = 'ft_auth_token'
const PRE2FA_TOKEN_KEY = 'ft_pre2fa_token'

function parseJwtPayload(token: string | null) {
  if (!token) return null
  try {
    const payload = token.split('.')[1] || ''
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

function saveToken(token: string | undefined | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
  emitAuthChange()
}

function savePre2faToken(token: string | undefined | null) {
  if (token) sessionStorage.setItem(PRE2FA_TOKEN_KEY, token || '')
  else sessionStorage.removeItem(PRE2FA_TOKEN_KEY)
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function getPre2faToken(): string | null {
  return sessionStorage.getItem(PRE2FA_TOKEN_KEY)
}

function emitAuthChange() {
  const token = getToken()
  const detail = { authenticated: !!token, payload: parseJwtPayload(token) }
  window.dispatchEvent(new CustomEvent('ft:authchange', { detail }))
}

async function login(login: string, password: string) {
  const res = await fetch('/auth/api/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ login, password })
  })
  const json: Json = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, status: res.status, body: json }
  // server may return token or only set cookie (pre_2fa workflow)
  if (json.token) saveToken(json.token)
  return { ok: true, body: json }
}

// Verify code during setup (expects auth cookie)
async function verify2faSetup(code: string) {
  const res = await fetchWithAuth('/auth/api/2fa/verify-setup', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ twofa_code: code })
  })
  const json: Json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, body: json }
}

// Verify code at login (expects pre-2FA token)
async function verify2faLogin(code: string) {
  const pre = getPre2faToken()
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (pre) headers['Authorization'] = 'Bearer ' + pre
  const res = await fetch('/auth/api/2fa/verify-login', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ twofa_code: code })
  })
  const json: Json = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, status: res.status, body: json }
  if (json.token) {
    savePre2faToken(null)
    saveToken(json.token)
  }
  return { ok: true, body: json }
}

async function logout() {
  try {
    await fetch('/auth/api/logout', { method: 'POST', credentials: 'include' })
  } catch {}
  // Clear client token regardless
  saveToken(null)
}

async function twofaStatus() {
  const res = await fetchWithAuth('/auth/api/2fa/status', { credentials: 'include' })
  const json: Json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, body: json }
}

async function twofaSetup() {
  const res = await fetchWithAuth('/auth/api/2fa/setup', {
    method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({})
  })
  const json: Json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, body: json }
}

async function twofaDisable() {
  // Optionally accept a 2FA code string as last argument via arguments
  const code = (arguments as any)[0] as string | undefined
  const init: RequestInit = { method: 'DELETE', credentials: 'include' }
  if (code) {
    init.headers = { 'content-type': 'application/json' }
    init.body = JSON.stringify({ twofa_code: code })
  }
  const res = await fetchWithAuth('/auth/api/2fa/disable', init)
  const json: Json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, body: json }
}

async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const token = getToken()
  const headers = new Headers(init?.headers || {})
  if (token) headers.set('Authorization', 'Bearer ' + token)
  const merged: RequestInit = Object.assign({}, init || {}, {
    credentials: init?.credentials ?? 'include',
    headers
  })
  return fetch(input, merged)
}

// Expose a simple global API for the SPA to consume
;(window as any).ftAuth = {
  login,
  logout,
  verify2faSetup,
  verify2faLogin,
  twofa: { status: twofaStatus, setup: twofaSetup, disable: twofaDisable },
  getToken,
  fetch: fetchWithAuth,
  setToken(token: string) { saveToken(token) },
  setPre2faToken(token: string) { savePre2faToken(token) },
  onChange(cb: (detail: any) => void) {
    const handler = (ev: Event) => cb((ev as CustomEvent).detail)
    window.addEventListener('ft:authchange', handler)
    return () => window.removeEventListener('ft:authchange', handler)
  },
  parseJwtPayload
}

// Emit initial state
emitAuthChange()

export {}
