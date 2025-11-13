type Json = Record<string, any>

function getFt(): any {
  return (window as any).ftAuth
}

type Route = '#/' | '#/login' | '#/signup' | '#/2fa' | '#/oauth-callback' | string

function navigate(to: Route) {
  if (location.hash !== to) location.hash = to
  else render()
}

function landingView() {
  const el = document.createElement('div')
  el.className = 'card rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm'
  el.innerHTML = `
    <h1 class="text-2xl font-semibold">Bienvenue 👋</h1>
    <p class="muted text-sm text-gray-500 dark:text-neutral-400">Connectez-vous ou créez un compte pour continuer.</p>
    <div class="actions mt-3">
      <button id="btn-login" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Login</button>
      <button id="btn-signup" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Sign up</button>
    </div>
  `
  el.querySelector<HTMLButtonElement>('#btn-login')?.addEventListener('click', () => navigate('#/login'))
  el.querySelector<HTMLButtonElement>('#btn-signup')?.addEventListener('click', () => navigate('#/signup'))
  return el
}

function twofaView() {
  const el = document.createElement('div')
  el.className = 'card rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm'
  el.innerHTML = `
    <h1 class="text-2xl font-semibold">Vérification 2FA</h1>
    <p class="muted text-sm text-gray-500 dark:text-neutral-400">Entrez le code à 6 chiffres de votre application d'authentification.</p>
    <form id="twofa-form">
      <label>Code 2FA</label>
      <input type="text" id="twofa" required minlength="6" maxlength="6" pattern="\\d{6}" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div class="actions mt-3">
        <button type="submit" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Vérifier</button>
        <a href="#/" class="button inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Annuler</a>
      </div>
    </form>
    <pre id="twofa-result" class="muted text-sm text-gray-500 dark:text-neutral-400"></pre>
  `
  const form = el.querySelector<HTMLFormElement>('#twofa-form')
  const out = el.querySelector<HTMLPreElement>('#twofa-result')
  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    const ft = getFt()
    if (!ft) return
    const code = (el.querySelector('#twofa') as HTMLInputElement)?.value || ''
    out && (out.textContent = 'Vérification...')
  const r = await ft.verify2faLogin(code)
    if (!r.ok) {
      out && (out.textContent = 'Erreur: ' + ((r.body && r.body.error) || r.status))
    } else {
      out && (out.textContent = '2FA validée. Connecté.')
      navigate('#/')
    }
  })
  return el
}

function navbar(authenticated: boolean, login: string | null) {
  const bar = document.createElement('header')
  bar.className = 'flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-800'
  const left = document.createElement('div')
  left.textContent = 'Transcendence'
  left.className = 'text-lg font-semibold'
  const right = document.createElement('div')
  right.className = 'flex items-center gap-3'
  if (authenticated) {
    // Avatar
    const avatar = document.createElement('img')
    avatar.id = 'nav-avatar'
    avatar.alt = 'Avatar'
    avatar.className = 'w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800'
    avatar.style.objectFit = 'cover'
    // Username placeholder (will be filled asynchronously)
    const user = document.createElement('span')
    user.id = 'nav-username'
    user.className = 'muted text-sm text-gray-500 dark:text-neutral-400 ml-2'
    user.textContent = login ? `${login}` : 'Connecté'
    const btn = document.createElement('button')
    btn.textContent = 'Logout'
    btn.className = 'inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700 ml-3'
    btn.addEventListener('click', async () => {
      const ft = getFt()
      if (ft) await ft.logout()
      navigate('#/')
    })
    right.append(avatar, user, btn)
  } else {
    const a = document.createElement('a')
    a.href = '#/login'
    a.className = 'button inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700'
    a.textContent = 'Login'
    right.appendChild(a)
  }
  bar.append(left, right)
  return bar
}

async function loadUserProfileAndAvatar() {
  const ft = getFt()
  if (!ft) return
  try {
    const res = await ft.fetch('/users/api/users/me')
    if (!res.ok) return
    const json = await res.json().catch(() => ({}))
    const username = json.username || null
  const avatar = json.avatar || '/avatars/img_default.png'
    const userEl = document.getElementById('nav-username')
    const avatarEl = document.getElementById('nav-avatar') as HTMLImageElement | null
    if (userEl && username) userEl.textContent = username
    if (avatarEl && avatar) avatarEl.src = avatar
  } catch {
    // ignore
  }
}

function loginView() {
  const el = document.createElement('div')
  el.className = 'card rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm'
  el.innerHTML = `
    <h1 class="text-2xl font-semibold">Login</h1>
    <div class="actions mb-4">
      <a id="btn-google-login" class="button inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700" href="/auth-google/login/google">Continuer avec Google</a>
    </div>
    <div id="login-msg" class="muted text-sm text-gray-500 dark:text-neutral-400"></div>
    <form id="login-form">
      <label>Login</label>
      <input type="text" id="login" required minlength="3" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <label>Password</label>
      <input type="password" id="password" required minlength="4" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div class="actions mt-3">
        <button type="submit" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Se connecter</button>
        <a href="#/" class="button inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Annuler</a>
      </div>
    </form>
    <pre id="login-result" class="muted text-sm text-gray-500 dark:text-neutral-400"></pre>
  `
  const form = el.querySelector<HTMLFormElement>('#login-form')
  const msg = el.querySelector<HTMLDivElement>('#login-msg')
  const out = el.querySelector<HTMLPreElement>('#login-result')
  // show message if redirected after Google registration
  const q = new URLSearchParams((location.hash.split('?')[1] || ''))
  if (q.get('registered') === '1' && msg) msg.textContent = 'Compte Google créé. Vous pouvez maintenant vous connecter.'
  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    const ft = getFt()
    const login = (el.querySelector('#login') as HTMLInputElement)?.value || ''
    const password = (el.querySelector('#password') as HTMLInputElement)?.value || ''
    if (!ft) return void (out && (out.textContent = 'Auth module not loaded'))
    out && (out.textContent = 'Connexion...')
    try {
      const r = await ft.login(login, password)
      if (!r.ok) return void (out && (out.textContent = 'Erreur: ' + ((r.body && r.body.error) || r.status)))
      if (r.body && r.body.pre_2fa_required) {
        out && (out.textContent = '2FA requise. Redirection…')
        navigate('#/2fa')
      } else {
        out && (out.textContent = 'Connecté.')
        navigate('#/')
      }
    } catch (e: any) {
      out && (out.textContent = 'Erreur: ' + (e?.message || e))
    }
  })
  return el
}

function signupView() {
  const el = document.createElement('div')
  el.className = 'card rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm'
  el.innerHTML = `
    <h1 class="text-2xl font-semibold">Créer un compte</h1>
    <p class="muted text-sm text-gray-500 dark:text-neutral-400">Choisissez une méthode d'inscription.</p>
    <div class="actions mb-4">
      <a id="btn-google" class="button inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700" href="/auth-google/login/google">Continuer avec Google</a>
    </div>
    <form id="signup-form">
      <label>Login</label>
      <input type="text" id="s-login" required minlength="3" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <label>Password</label>
      <input type="password" id="s-password" required minlength="4" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div class="actions mt-3">
        <button type="submit" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Créer mon compte</button>
        <a href="#/" class="button inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Annuler</a>
      </div>
    </form>
    <pre id="signup-result" class="muted text-sm text-gray-500 dark:text-neutral-400"></pre>
  `
  const form = el.querySelector<HTMLFormElement>('#signup-form')
  const out = el.querySelector<HTMLPreElement>('#signup-result')
  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    const login = (el.querySelector('#s-login') as HTMLInputElement)?.value || ''
    const password = (el.querySelector('#s-password') as HTMLInputElement)?.value || ''
    out && (out.textContent = 'Création du compte...')
    try {
      const res = await fetch('/auth/api/register', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ login, password }), credentials: 'include'
      })
      const json: Json = await res.json().catch(() => ({}))
      if (!res.ok) return void (out && (out.textContent = 'Erreur: ' + ((json && json.error) || res.status)))
      // Auto-login if token is returned
      const ft = getFt()
      if (json.token && ft && typeof ft.setToken === 'function') {
        ft.setToken(json.token)
        out && (out.textContent = 'Compte créé et connecté.')
        navigate('#/')
      } else {
        out && (out.textContent = 'Compte créé. Vous pouvez maintenant vous connecter.')
        navigate('#/login')
      }
    } catch (e: any) {
      out && (out.textContent = 'Erreur: ' + (e?.message || e))
    }
  })
  return el
}

function oauthCallbackView() {
  const el = document.createElement('div')
  el.className = 'card rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm'
  el.innerHTML = `
    <h1 class="text-2xl font-semibold">Connexion en cours…</h1>
    <p class="muted text-sm text-gray-500 dark:text-neutral-400">Traitement du retour Google…</p>
  `
  ;(async () => {
    try {
      const hash = location.hash
      const qs = hash.includes('?') ? hash.split('?')[1] : ''
      const p = new URLSearchParams(qs)
      const token = p.get('token')
      const twofa = p.get('twofa') === '1'
      const ft = getFt()
      if (token && ft) {
        if (twofa) {
          ft.setPre2faToken(token)
          navigate('#/2fa')
        } else {
          ft.setToken(token)
          navigate('#/')
        }
      } else {
        navigate('#/login')
      }
    } catch {
      navigate('#/login')
    }
  })()
  return el
}

function render() {
  const app = document.getElementById('app')
  if (!app) return
  app.innerHTML = ''
  const route = (location.hash || '#/') as Route
  const ft = getFt()
  const token = ft && typeof ft.getToken === 'function' ? ft.getToken() : null
  const payload = ft && typeof ft.parseJwtPayload === 'function' ? ft.parseJwtPayload(token) : null
  const authenticated = !!token
  // navbar
  app.appendChild(navbar(authenticated, payload?.login || null))
  if (authenticated) loadUserProfileAndAvatar()
  // page
  const page = document.createElement('div')
  if (route === '#/' && !authenticated) page.appendChild(landingView())
  else if (route === '#/login') page.appendChild(loginView())
  else if (route === '#/signup') page.appendChild(signupView())
  else if (route === '#/2fa') page.appendChild(twofaView())
  else if (route === '#/oauth-callback') page.appendChild(oauthCallbackView())
  else if (!authenticated) page.appendChild(landingView())
  else {
    const el = document.createElement('div')
    el.className = 'card rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm'
    el.innerHTML = `<h1 class="text-2xl font-semibold">Accueil</h1><p class="muted text-sm text-gray-500 dark:text-neutral-400">Vous êtes connecté.</p>`
    // 2FA settings
    const twofaBlock = document.createElement('div')
    twofaBlock.className = 'mt-4'
    twofaBlock.innerHTML = `<h3>Authentification à deux facteurs</h3>
      <div id="twofa-status" class="muted text-sm text-gray-500 dark:text-neutral-400">Chargement du statut…</div>
      <div id="twofa-actions" class="actions mt-3"></div>
      <div id="twofa-setup" class="mt-3"></div>
      <pre id="twofa-msg" class="muted text-sm text-gray-500 dark:text-neutral-400"></pre>`
    el.appendChild(twofaBlock)
    page.appendChild(el)
    // load status async
    ;(async () => {
      const statusEl = twofaBlock.querySelector<HTMLDivElement>('#twofa-status')!
      const actionsEl = twofaBlock.querySelector<HTMLDivElement>('#twofa-actions')!
      const setupEl = twofaBlock.querySelector<HTMLDivElement>('#twofa-setup')!
      const msgEl = twofaBlock.querySelector<HTMLPreElement>('#twofa-msg')!
      const ft = getFt()
      if (!ft) return
      const st = await ft.twofa.status()
      if (!st.ok) {
        statusEl.textContent = 'Statut indisponible.'
        return
      }
      const enabled = !!st.body?.enabled
      statusEl.textContent = enabled ? '2FA: activée' : '2FA: désactivée'
      actionsEl.innerHTML = ''
      setupEl.innerHTML = ''
      if (!enabled) {
        const btn = document.createElement('button')
        btn.textContent = 'Activer 2FA'
        btn.className = 'inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700'
        btn.addEventListener('click', async () => {
          msgEl.textContent = 'Initialisation…'
          const r = await ft.twofa.setup()
          if (!r.ok) {
            msgEl.textContent = 'Erreur: ' + ((r.body && r.body.error) || r.status)
            return
          }
          msgEl.textContent = 'Scannez le QR puis validez avec votre code.'
          const img = document.createElement('img')
          img.alt = 'QR 2FA'
          img.src = r.body.qr_base64 || ''
          img.style.maxWidth = '200px'
          const form = document.createElement('form')
          form.innerHTML = `
            <label>Code 2FA</label>
            <input type="text" id="code2" required minlength="6" maxlength="6" pattern="\\d{6}" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div class="actions mt-3">
              <button type="submit" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Valider</button>
            </div>`
          form.addEventListener('submit', async (ev) => {
            ev.preventDefault()
            const code = (form.querySelector('#code2') as HTMLInputElement)?.value || ''
            msgEl.textContent = 'Vérification…'
            const vr = await ft.verify2faSetup(code)
            if (!vr.ok) {
              msgEl.textContent = 'Erreur: ' + ((vr.body && vr.body.error) || vr.status)
            } else {
              msgEl.textContent = '2FA activée.'
              render()
            }
          })
          setupEl.replaceChildren(img, form)
        })
        actionsEl.appendChild(btn)
      } else {
        const btn = document.createElement('button')
        btn.textContent = 'Désactiver 2FA'
        btn.className = 'inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700'
        btn.addEventListener('click', async () => {
          msgEl.textContent = 'Désactivation…'
          const r = await ft.twofa.disable()
          if (!r.ok) msgEl.textContent = 'Erreur: ' + ((r.body && r.body.error) || r.status)
          else {
            msgEl.textContent = '2FA désactivée.'
            render()
          }
        })
        actionsEl.appendChild(btn)
      }
    })()
  }
  page.className = 'max-w-3xl mx-auto px-4 mt-4'
  app.appendChild(page)
}

window.addEventListener('hashchange', render)
window.addEventListener('ft:authchange', render as any)
// initial
render()
