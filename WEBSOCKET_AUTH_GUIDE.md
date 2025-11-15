# 🔌 Guide complet : Authentification WebSocket avec JWT

## 📌 Vue d'ensemble

Voici comment fonctionne l'authentification WebSocket dans votre projet :

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                        │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │ 1. POST /api/socials/connect-token
               │    Headers: Authorization: Bearer {JWT}
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                         │
│  - Vérifie les headers                                           │
│  - Passe les cookies HttpOnly                                    │
│  - Route vers le bon service                                     │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │ 2. Service Social (Fastify)
               │    - Valide le JWT principal
               │    - Génère un token unique (10s)
               │
               │ Réponse: { success: true, token: "ws-token-xyz" }
               │
               │ 3. Client reçoit le token unique
               │
               │ 4. WebSocket connect: ws://localhost:8080/social/api/socials/ws?token=ws-token-xyz
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                         │
│  - Upgrade HTTP → WebSocket                                      │
│  - Passe les headers: Upgrade, Connection                        │
│  - Passe les cookies HttpOnly                                    │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │ 5. Service Social (WebSocket handler)
               │    - Récupère le token des query params
               │    - Valide le token unique
               │    - Établit la connexion WebSocket
               │
               │ 6. Communication bidirectionnelle
               │    socket.send() / socket.on('message')
               │
               └─ Déconnexion ─────────────────────────────────────
```

---

## 🔐 Étape 1 : Obtenir le token unique de connexion

### Route HTTP :
```
GET /api/socials/connect-token
Authorization: Bearer {votre-jwt-principal}
```

### Réponse :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Ce que le serveur fait :
1. Vérifie que votre JWT principal est valide (via `jwtAuthMiddleware`)
2. Extrait votre `user_id` et `login` du JWT
3. Crée un **nouveau JWT temporaire** avec :
   - Durée de vie très courte : **10 secondes**
   - Marque spéciale : `type: 'ws-connect'`
   - Vos infos utilisateur

### Code serveur :
```typescript
const connectToken = jwt.sign(
  {
    user_id: userId,
    login: login,
    type: 'ws-connect' // Important : marque ce token
  },
  jwtSecret,
  { expiresIn: '10s' }  // Expiration courte
)
```

---

## 🔌 Étape 2 : Se connecter au WebSocket

### Depuis le client JavaScript :

```javascript
// 1. D'abord, obtenir le token unique
const response = await fetch('/api/socials/connect-token', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${votre_jwt_principal}`
  }
})

const { token } = await response.json()

// 2. Créer la connexion WebSocket avec ce token
const ws = new WebSocket(
  `ws://localhost:8080/social/api/socials/ws?token=${token}`
)

// 3. Écouter les événements
ws.onopen = () => {
  console.log('✅ Connecté au WebSocket !')
}

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  console.log('📨 Message reçu:', message)
}

ws.onerror = (error) => {
  console.error('❌ Erreur WebSocket:', error)
}

ws.onclose = () => {
  console.log('🔌 Déconnecté')
}

// 4. Envoyer un message
ws.send(JSON.stringify({
  type: 'chat',
  content: 'Bonjour !',
  timestamp: new Date().toISOString()
}))
```

### Ce que le serveur fait lors de la connexion WebSocket :
1. Récupère le token en query params : `?token=...`
2. Valide ce token avec la même clé secrète (`JWT_SECRET`)
3. Vérifie que c'est bien un token `type: 'ws-connect'`
4. Établit la connexion WebSocket
5. Envoie un message de bienvenue

---

## 🛡️ Pourquoi cette approche ?

### ❌ Problème initial : Les WebSockets ne supportent pas les headers HTTP personnalisés

```
// ❌ Ceci ne fonctionne PAS :
const ws = new WebSocket('ws://localhost:8080/ws', {
  headers: {
    'Authorization': 'Bearer mon-jwt'  // ← Ignoré !
  }
})
```

**Raison** : Pour des raisons de sécurité (CORS), les navigateurs n'envoient que les headers standard lors du handshake WebSocket.

### ✅ Solution : Token unique + Query Params

Les cookies HttpOnly sont **automatiquement** envoyés, mais pour un contrôle maximal :

1. **Token principal** (JWT) : stocké dans un cookie HttpOnly
   - Durée : 15 minutes
   - Utilisé pour l'authentification HTTP classique

2. **Token de connexion WS** (JWT temporaire) : passé en query params
   - Durée : 10 secondes
   - Utilisé une seule fois pour établir la connexion WebSocket
   - Contient une marque `type: 'ws-connect'` pour éviter la réutilisation d'autres tokens

### Avantages :
✅ **Sécurisé** : Token unique + durée courte = pas de risque de vol  
✅ **Flexible** : Fonctionne avec les navigateurs et les clients natifs  
✅ **Simple** : Pas de configuration complexe nécessaire  
✅ **Scalable** : Chaque connexion a son propre token  

---

## 🌍 Configuration NGINX pour les WebSockets

### Configuration requise :

```nginx
location /social/api/socials/ws {
  proxy_pass http://social:3000/api/socials/ws;
  
  # ✅ Transformer HTTP en WebSocket
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  
  # ✅ Passer les en-têtes essentiels
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  
  # ✅ IMPORTANT : Passer les cookies HttpOnly
  proxy_set_header Cookie $http_cookie;
  
  # ✅ Timeout long (24h) pour garder la connexion ouverte
  proxy_read_timeout 86400;
}
```

### Chaque ligne expliquée :

| Header | Pourquoi |
|--------|---------|
| `proxy_http_version 1.1` | WebSocket nécessite HTTP/1.1 |
| `Upgrade: websocket` | Signal pour upgrader la connexion |
| `Connection: upgrade` | Demande l'upgrade au serveur |
| `Cookie: $http_cookie` | Passe les cookies HttpOnly |
| `proxy_read_timeout` | Garde la connexion ouverte longtemps |

---

## 📊 Cross-Origin et Handshake

### Qu'est-ce que Cross-Origin ?

```
Mon site : https://example.com
Backend : https://api.example.com

Même domaine → Pas cross-origin ✅
Domaine différent → Cross-origin ⚠️
```

### Qu'est-ce que le Handshake WebSocket ?

C'est la négociation initiale :

```
Client                           Serveur
  │                                │
  ├─ GET /ws HTTP/1.1 ────────────>│
  │  Upgrade: websocket             │
  │  Connection: upgrade            │
  │  Sec-WebSocket-Key: ...        │
  │                                │
  │<────── HTTP 101 Switching ──────┤
  │  Upgrade: websocket             │
  │  Connection: Upgrade            │
  │                                │
  │═══════════════════════════════════
  │  Connexion WebSocket établie
  │═══════════════════════════════════
```

**NGINX doit passer les headers correctement** pour que ce handshake réussisse.

---

## 🔄 Flow complet avec votre architecture

### 1️⃣ L'utilisateur se connecte au login

```
POST /api/login
body: { login: "user", password: "pass" }

↓ Service Auth

Réponse:
{
  token: "eyJhbGc..." // JWT principal (1h)
}

↓ Client
Set-Cookie: auth_token=eyJhbGc... (HttpOnly)
```

### 2️⃣ L'utilisateur veut accéder au chat (WebSocket)

```
GET /api/socials/connect-token
Headers: Authorization: Bearer eyJhbGc...

↓ Middleware jwtAuthMiddleware
  - Vérifie le JWT principal
  - Extrait user_id et login

↓ Génère un token temporaire

Réponse:
{
  success: true,
  token: "eyJhbGc...type:ws-connect..." // 10s
}
```

### 3️⃣ Le client établit la WebSocket

```
WebSocket connect: 
ws://localhost:8080/social/api/socials/ws?token=eyJhbGc...

↓ NGINX
  - Reconnaît que c'est une WebSocket
  - Passe les headers Upgrade/Connection
  - Passe les cookies
  - Route vers le service social

↓ Service Social
  - Récupère le token des query params
  - Valide : JWT valide ? Type = ws-connect ? Pas expiré ?
  - Établit la connexion

Réponse:
{
  type: "connected",
  userId: 123,
  login: "user",
  message: "Welcome to Social WebSocket!"
}
```

### 4️⃣ Communication en temps réel

```
Client                    Service Social
  │                           │
  ├─ send({ type: 'message' }─>│
  │                           │
  │<─ echo response ───────────┤
  │                           │
  │  ... (connexion persistante)
  │                           │
  ├─ close() ───────────────> │
  │                           └─ log: User disconnected
```

---

## ⚙️ Structure du projet

```
services/social/app/
├── routes/
│   └── socialRoutes.ts        ← Vos 2 routes
│       ├── /api/socials/connect-token    (HTTP GET)
│       └── /api/socials/ws               (WebSocket)
├── index.ts                   ← Enregistrement des routes
└── database/

services/nginx/conf/
└── default.conf               ← Configuration WebSocket
```

---

## 🧪 Tests manuels

### 1. Tester la route HTTP

```bash
# 1. Obtenir un JWT principal
JWT=$(curl -s -X POST http://localhost:8080/auth/api/login \
  -H "Content-Type: application/json" \
  -d '{"login":"user","password":"pass"}' \
  | jq -r '.token')

# 2. Obtenir le token WebSocket
TOKEN=$(curl -s -X GET http://localhost:8080/social/api/socials/connect-token \
  -H "Authorization: Bearer $JWT" \
  | jq -r '.token')

echo "Token WebSocket: $TOKEN"
```

### 2. Tester la WebSocket

```bash
# Utiliser wscat
npm install -g wscat

wscat -c "ws://localhost:8080/social/api/socials/ws?token=$TOKEN"

# Puis envoyer des messages JSON :
# > {"type":"chat","content":"Hello!"}
# < {"type":"echo",...}
```

---

## 🚨 Erreurs courantes et solutions

### ❌ "Token required"
**Cause** : Vous n'avez pas passé le token en query params  
**Solution** : Vérifiez l'URL WebSocket inclut `?token=...`

### ❌ "Invalid or expired token"
**Cause** : Le token a plus de 10 secondes  
**Solution** : Obtenez un nouveau token via `/api/socials/connect-token`

### ❌ "Invalid token type"
**Cause** : Vous avez essayé d'utiliser un JWT principal au lieu du token WS  
**Solution** : Utilisez le token retourné par `/api/socials/connect-token`

### ❌ NGINX : "502 Bad Gateway"
**Cause** : NGINX ne peut pas convertir la requête WebSocket  
**Solution** : Vérifiez les headers `Upgrade` et `Connection` dans NGINX

### ❌ NGINX : "Connection refused"
**Cause** : Le service social n'est pas en cours d'exécution  
**Solution** : Vérifiez que `docker-compose up social` fonctionne

---

## 📚 Ressources

- [RFC 6455 - WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
- [JWT (JSON Web Token) - RFC 7519](https://tools.ietf.org/html/rfc7519)
- [NGINX WebSocket Proxying](https://nginx.org/en/docs/http/websocket.html)
- [Fastify WebSocket Documentation](https://github.com/fastify/fastify-websocket)





