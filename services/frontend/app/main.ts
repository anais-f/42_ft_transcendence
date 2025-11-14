type Json = Record<string, any>

// Use explicit .js extension so the browser requests /ui.js (correct MIME) when modules are loaded from the server
import { createGoogleButton, BUTTON_CLASSES, HEADLINE_CLASSES, SUBHEAD_CLASSES } from './ui.js'

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
  el.className = 'rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm'
  el.innerHTML = `
    <div class="mb-4">
      <div class="${SUBHEAD_CLASSES}">Le quotidien du Pong</div>
      <h1 class="${HEADLINE_CLASSES}">Jouez maintenant, devenez une légende</h1>
      <p class="text-sm text-gray-600 dark:text-neutral-400 mt-2">Matchs en direct, classements, avatars — tout ce qu'il faut pour la gloire.</p>
    </div>
    <div class="actions mt-2">
      <button id="btn-login" class="${BUTTON_CLASSES}">Login</button>
      <button id="btn-signup" class="${BUTTON_CLASSES}">Sign up</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div class="md:col-span-2 rounded-lg border border-gray-200 dark:border-neutral-800 p-4">
        <div class="${SUBHEAD_CLASSES} mb-2">Résultats récents</div>
        <ul class="space-y-2 text-sm text-gray-700 dark:text-neutral-300">
          <li class="flex justify-between"><span>Player A vs Player B</span><span>11–9</span></li>
          <li class="flex justify-between"><span>Player C vs Player D</span><span>7–11</span></li>
          <li class="flex justify-between"><span>Player E vs Player F</span><span>10–12</span></li>
        </ul>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-neutral-800 p-4">
        <div class="${SUBHEAD_CLASSES} mb-2">Classement</div>
        <ol class="text-sm text-gray-700 dark:text-neutral-300 space-y-1 list-decimal list-inside">
          <li>anaïs</li>
          <li>mjuffard</li>
          <li>guest</li>
        </ol>
      </div>
    </div>
  `
  // append google button beside login/signup to reuse it for both actions
  const actions = el.querySelector('.actions')
  if (actions) actions.appendChild(createGoogleButton('btn-google-landing'))
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
        <a href="#/" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Annuler</a>
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
  // some frontends expose verify2faLogin, others expose verify2fa — support both
  const verifyLogin = typeof ft.verify2faLogin === 'function' ? ft.verify2faLogin.bind(ft) : ft.verify2fa?.bind(ft)
  const r = verifyLogin ? await verifyLogin(code) : { ok: false, status: 500, body: { error: 'Auth verify API missing' } }
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
  left.className = 'flex items-baseline gap-3'
  const brand = document.createElement('div')
  brand.textContent = 'Transcendence'
  brand.className = 'font-serif text-2xl tracking-tight'
  const date = document.createElement('div')
  try {
    const d = new Date()
    const fmt = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    date.textContent = fmt
  } catch { date.textContent = '' }
  date.className = 'text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-400'
  left.append(brand, date)
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
  a.className = BUTTON_CLASSES
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
      if (avatarEl && avatar) {
        avatarEl.src = avatar
        avatarEl.style.cursor = 'pointer'
        avatarEl.addEventListener('click', () => openAvatarModal(avatar))
      }
  } catch {
    // ignore
  }
}

  function openAvatarModal(src: string) {
    // prevent multiple modals
    if (document.getElementById('avatar-modal')) return
    const modal = document.createElement('div')
    modal.id = 'avatar-modal'
    modal.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'
    modal.style.padding = '20px'

    const container = document.createElement('div')
    container.className = 'bg-white dark:bg-neutral-900 rounded-lg p-4 max-w-xl w-full'

    const img = document.createElement('img')
    img.src = src
    img.alt = 'Avatar large'
    img.className = 'w-full h-auto rounded-md mb-3'
    img.style.maxHeight = '80vh'
    img.style.objectFit = 'contain'

    const controls = document.createElement('div')
    controls.className = 'flex items-center gap-3'

    const uploadLabel = document.createElement('label')
    uploadLabel.className = 'inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 cursor-pointer'
    uploadLabel.textContent = 'Changer l\'avatar'
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.style.display = 'none'
    uploadLabel.appendChild(fileInput)

    const closeBtn = document.createElement('button')
    closeBtn.className = 'inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2'
    closeBtn.textContent = 'Fermer'
    closeBtn.addEventListener('click', () => closeAvatarModal())

    controls.append(uploadLabel, closeBtn)
    container.append(img, controls)
    modal.appendChild(container)
    document.body.appendChild(modal)

    fileInput.addEventListener('change', async (ev) => {
      const f = (ev.target as HTMLInputElement).files?.[0]
      if (!f) return
      await uploadAvatarFile(f)
      // reload user profile/avatar
      await loadUserProfileAndAvatar()
      closeAvatarModal()
    })
  }

  function closeAvatarModal() {
    const modal = document.getElementById('avatar-modal')
    if (modal) modal.remove()
  }

  function openDisable2faModal(msgEl?: HTMLElement | null) {
    // prevent multiple modals
    if (document.getElementById('disable-2fa-modal')) return
    const modal = document.createElement('div')
    modal.id = 'disable-2fa-modal'
    modal.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'
    modal.style.padding = '20px'

    const container = document.createElement('div')
    container.className = 'bg-white dark:bg-neutral-900 rounded-lg p-4 max-w-md w-full'

    const title = document.createElement('h3')
    title.className = 'text-lg font-semibold mb-2'
    title.textContent = 'Désactiver 2FA'

    const desc = document.createElement('p')
    desc.className = 'muted text-sm text-gray-500 dark:text-neutral-400 mb-3'
    desc.textContent = "Entrez votre code 2FA pour confirmer la désactivation."

    const form = document.createElement('form')
    form.innerHTML = `
      <label>Code 2FA</label>
      <input type="text" id="disable-2fa-code" required minlength="6" maxlength="6" pattern="\\d{6}" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" />
      <div class="flex items-center gap-3">
        <button type="submit" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Confirmer</button>
        <button type="button" id="disable-2fa-cancel" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2">Annuler</button>
      </div>`

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault()
      const code = (form.querySelector('#disable-2fa-code') as HTMLInputElement)?.value || ''
      if (msgEl) msgEl.textContent = 'Désactivation…'
      const ft = getFt()
      if (!ft) {
        if (msgEl) msgEl.textContent = 'Module auth introuvable.'
        return
      }
      const r = await ft.twofa.disable(code)
      if (!r.ok) {
        if (msgEl) msgEl.textContent = 'Erreur: ' + ((r.body && r.body.error) || r.status)
      } else {
        if (msgEl) msgEl.textContent = '2FA désactivée.'
        closeDisable2faModal()
        render()
      }
    })

    container.append(title, desc, form)
    modal.appendChild(container)
    document.body.appendChild(modal)

    const cancel = document.getElementById('disable-2fa-cancel')
    cancel?.addEventListener('click', () => closeDisable2faModal())
  }

  function closeDisable2faModal() {
    const modal = document.getElementById('disable-2fa-modal')
    if (modal) modal.remove()
  }

  async function uploadAvatarFile(file: File) {
    const ft = getFt()
    if (!ft) return
    const fd = new FormData()
    fd.append('file', file, file.name)
    try {
      const res = await ft.fetch('/users/api/users/me/avatar', {
        method: 'PATCH',
        body: fd
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        alert('Erreur upload avatar: ' + ((json && json.error) || res.status))
        return
      }
      // success
    } catch (e: any) {
      alert('Erreur upload avatar: ' + (e?.message || e))
    }
  }

function loginView() {
  const el = document.createElement('div')
  el.className = 'card rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm'
  el.innerHTML = `
    <h1 class="text-2xl font-semibold">Login</h1>
    <div class="actions mb-4"></div>
    <div id="login-msg" class="muted text-sm text-gray-500 dark:text-neutral-400"></div>
    <form id="login-form">
      <label>Login</label>
      <input type="text" id="login" required minlength="3" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <label>Password</label>
      <input type="password" id="password" required minlength="4" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div class="actions mt-3">
        <button type="submit" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Se connecter</button>
        <a href="#/" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Annuler</a>
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
    <div class="actions mb-4"></div>
    <form id="signup-form">
      <label>Login</label>
      <input type="text" id="s-login" required minlength="3" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <label>Password</label>
      <input type="password" id="s-password" required minlength="4" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div class="actions mt-3">
        <button type="submit" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Créer mon compte</button>
        <a href="#/" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Annuler</a>
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
                        // support both naming conventions from different builds
                        const verifySetup = typeof ft.verify2faSetup === 'function' ? ft.verify2faSetup.bind(ft) : ft.verify2fa?.bind(ft)
                        const vr = verifySetup ? await verifySetup(code) : { ok: false, status: 500, body: { error: 'Auth verify API missing' } }
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
        btn.addEventListener('click', () => {
          // Render an inline disable form inside the same setup block (same frame as activation)
          setupEl.innerHTML = ''
          const form = document.createElement('form')
          form.innerHTML = `
            <label>Code 2FA</label>
            <input type="text" id="disable-code" required minlength="6" maxlength="6" pattern="\\d{6}" class="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" />
            <div class="actions mt-3">
              <button type="submit" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700">Confirmer</button>
              <button type="button" id="cancel-disable-2fa" class="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2">Annuler</button>
            </div>`
          form.addEventListener('submit', async (ev) => {
            ev.preventDefault()
            const code = (form.querySelector('#disable-code') as HTMLInputElement)?.value || ''
            msgEl.textContent = 'Désactivation…'
            const r = await ft.twofa.disable(code)
            if (!r.ok) msgEl.textContent = 'Erreur: ' + ((r.body && r.body.error) || r.status)
            else {
              msgEl.textContent = '2FA désactivée.'
              render()
            }
          })
          const cancel = form.querySelector('#cancel-disable-2fa') as HTMLButtonElement
          cancel.addEventListener('click', () => {
            // restore by re-rendering the page
            render()
          })
          setupEl.appendChild(form)
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
