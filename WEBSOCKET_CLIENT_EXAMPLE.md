# 🔌 Exemple d'utilisation du WebSocket avec JWT temporaire

## Flow complet : Login → WebSocket

### Étape 1 : L'utilisateur se connecte

```javascript
// Frontend JavaScript
async function login(username, password) {
  const response = await fetch('/auth/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      login: username,
      password: password
    })
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  const data = await response.json()
  
  // Le JWT principal est maintenant dans un cookie HttpOnly
  // Il sera automatiquement envoyé avec toutes les requêtes futures
  console.log('✅ Logged in successfully!')
  
  return data
}
```

### Étape 2 : Obtenir le token WebSocket temporaire

```javascript
async function getWebSocketToken() {
  const response = await fetch('/social/api/socials/connect-token', {
    method: 'GET',
    credentials: 'include' // Important : envoie automatiquement les cookies
  })

  if (!response.ok) {
    throw new Error('Failed to get WebSocket token')
  }

  const data = await response.json()
  return data.token // Token valide 10 secondes
}
```

### Étape 3 : Se connecter au WebSocket

```javascript
async function connectWebSocket() {
  // 1. Obtenir le token temporaire
  const wsToken = await getWebSocketToken()
  
  // 2. Créer la connexion WebSocket avec le token en query param
  const ws = new WebSocket(
    `ws://localhost:8080/social/api/socials/ws?token=${wsToken}`
  )

  // 3. Gérer les événements
  ws.onopen = () => {
    console.log('🔌 WebSocket connected!')
  }

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data)
    console.log('📨 Message received:', message)
    
    // Gérer les différents types de messages
    switch(message.type) {
      case 'connected':
        console.log(`✅ Welcome ${message.login}!`)
        break
      case 'echo':
        console.log('Echo:', message.data)
        break
      case 'error':
        console.error('Error:', message.message)
        break
    }
  }

  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error)
  }

  ws.onclose = (event) => {
    console.log('🔌 WebSocket disconnected:', event.code, event.reason)
  }

  return ws
}
```

### Étape 4 : Envoyer des messages

```javascript
function sendMessage(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'chat',
      content: message,
      timestamp: new Date().toISOString()
    }))
  } else {
    console.error('WebSocket is not open')
  }
}
```

## 🎯 Exemple complet : Classe WebSocket Manager

```javascript
class SocialWebSocketManager {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  async connect() {
    try {
      // Obtenir le token temporaire
      const wsToken = await this.getWebSocketToken()
      
      // Créer la connexion
      this.ws = new WebSocket(
        `ws://localhost:8080/social/api/socials/ws?token=${wsToken}`
      )

      this.setupEventHandlers()
      
    } catch (error) {
      console.error('Failed to connect:', error)
      this.handleReconnect()
    }
  }

  async getWebSocketToken() {
    const response = await fetch('/social/api/socials/connect-token', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to get WebSocket token')
    }

    const data = await response.json()
    return data.token
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('✅ Connected to Social WebSocket')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.handleMessage(message)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    this.ws.onclose = (event) => {
      console.log('Disconnected:', event.code, event.reason)
      
      // Reconnexion automatique si ce n'est pas une fermeture normale
      if (event.code !== 1000) {
        this.handleReconnect()
      }
    }
  }

  handleMessage(message) {
    switch(message.type) {
      case 'connected':
        console.log(`Welcome ${message.login}!`)
        break
        
      case 'echo':
        console.log('Echo received:', message.data)
        break
        
      case 'error':
        console.error('Server error:', message.message)
        break
        
      default:
        console.log('Unknown message type:', message)
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  async handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      // Attendre avant de reconnecter (backoff exponentiel)
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      await this.connect()
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
  }
}
```

## 💻 Utilisation pratique

```javascript
// Après le login
async function setupApp() {
  try {
    // 1. Login
    await login('myusername', 'mypassword')
    
    // 2. Créer et connecter le WebSocket
    const wsManager = new SocialWebSocketManager()
    await wsManager.connect()
    
    // 3. Envoyer un message après connexion
    setTimeout(() => {
      wsManager.send({
        type: 'chat',
        content: 'Hello from client!'
      })
    }, 1000)
    
    // 4. Déconnexion propre quand l'utilisateur quitte
    window.addEventListener('beforeunload', () => {
      wsManager.disconnect()
    })
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

// Démarrer l'app
setupApp()
```

## 🔒 Points de sécurité importants

### ✅ Ce qui est sécurisé :
- Le JWT principal est dans un cookie HttpOnly (JavaScript ne peut pas y accéder)
- Le token WebSocket expire en 10 secondes
- Le token WebSocket a un type spécial `ws-connect` (ne peut pas être réutilisé ailleurs)

### ⚠️ Ce qui est exposé :
- Le token temporaire passe en query param (visible dans les logs)
- **Mais** : il expire en 10s et ne peut servir qu'à établir la connexion

### 🛡️ Recommandations :
- Ne loguez jamais les query params contenant des tokens en production
- Utilisez HTTPS/WSS en production
- Régénérez un nouveau token à chaque reconnexion

## 🧪 Test rapide dans la console du navigateur

```javascript
// 1. Login d'abord (remplacez avec vos credentials)
await fetch('/auth/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ login: 'test', password: 'test' })
})

// 2. Obtenir le token WebSocket
const res = await fetch('/social/api/socials/connect-token', {
  credentials: 'include'
})
const { token } = await res.json()
console.log('Token:', token)

// 3. Connecter le WebSocket
const ws = new WebSocket(`ws://localhost:8080/social/api/socials/ws?token=${token}`)
ws.onmessage = (e) => console.log('Message:', JSON.parse(e.data))
ws.onopen = () => console.log('Connected!')

// 4. Envoyer un message
ws.send(JSON.stringify({ type: 'test', content: 'Hello!' }))
```

