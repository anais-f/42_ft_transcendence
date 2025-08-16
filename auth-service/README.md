# Microservice d'Authentification - ft_transcendence

## 📋 Description

Ce microservice d'authentification fournit une API REST complète pour la gestion des utilisateurs avec Fastify et SQLite. Il est conçu pour être simple à comprendre et à utiliser, parfait pour les débutants en développement web.

## 🏗️ Architecture

```
auth-service/
├── package.json          # Configuration Node.js et dépendances
├── server.js             # Serveur principal Fastify
├── config/
│   └── database.js       # Configuration SQLite et gestion de la base
├── routes/
│   └── auth.js          # Routes d'authentification (register, login, profile)
├── models/
│   └── User.js          # Modèle utilisateur et fonctions de base de données
├── middleware/
│   └── auth.js          # Middleware JWT pour protéger les routes
└── README.md            # Cette documentation
```

## 🔧 Technologies Utilisées

- **Fastify** : Framework web ultra-rapide pour Node.js
- **SQLite** : Base de données légère et locale
- **bcryptjs** : Hashage sécurisé des mots de passe
- **jsonwebtoken** : Gestion des tokens JWT pour l'authentification
- **@fastify/cors** : Gestion des requêtes cross-origin

## 📦 Installation

### 1. Prérequis
- Node.js version 18 ou supérieure
- npm (inclus avec Node.js)

### 2. Installation des dépendances
```bash
cd auth-service
npm install
```

### 3. Démarrage du serveur
```bash
# Mode production
npm start

# Mode développement (redémarre automatiquement lors des changements)
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

## 🚀 Utilisation

### Vue d'ensemble des endpoints

| Méthode | Endpoint | Description | Protection |
|---------|----------|-------------|------------|
| GET | `/` | Information sur l'API | Public |
| GET | `/health` | Vérification de l'état du service | Public |
| POST | `/register` | Créer un nouveau compte | Public |
| POST | `/login` | Se connecter | Public |
| GET | `/profile` | Récupérer le profil utilisateur | 🔒 JWT requis |

### 📝 Exemples d'utilisation avec curl

#### 1. Vérifier l'état du service
```bash
curl -X GET http://localhost:3001/health
```

**Réponse attendue :**
```json
{
  "status": "OK",
  "message": "Service d'authentification opérationnel",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 2. Créer un compte (Inscription)
```bash
curl -X POST http://localhost:3001/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "utilisateur@example.com",
    "password": "motdepasse123"
  }'
```

**Réponse de succès :**
```json
{
  "message": "Compte créé avec succès",
  "user": {
    "id": 1,
    "email": "utilisateur@example.com",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Se connecter
```bash
curl -X POST http://localhost:3001/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "utilisateur@example.com",
    "password": "motdepasse123"
  }'
```

**Réponse de succès :**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "email": "utilisateur@example.com",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Récupérer le profil (Route protégée)
```bash
# Remplacez VOTRE_TOKEN par le token reçu lors de la connexion
curl -X GET http://localhost:3001/profile \\
  -H "Authorization: Bearer VOTRE_TOKEN"
```

**Réponse de succès :**
```json
{
  "message": "Profil récupéré avec succès",
  "user": {
    "id": 1,
    "email": "utilisateur@example.com",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔒 Sécurité

### Hashage des mots de passe
- Les mots de passe sont hashés avec **bcrypt** et un salt de 12 rounds
- Les mots de passe en clair ne sont jamais stockés en base de données
- Les mots de passe ne sont jamais retournés dans les réponses API

### Tokens JWT
- Durée de validité : 24 heures
- Clé secrète : configurable via variable d'environnement `JWT_SECRET`
- Format requis : `Authorization: Bearer <token>`

### Validation des données
- Validation automatique des formats d'email
- Mot de passe minimum 6 caractères
- Gestion des erreurs détaillées

## 🗄️ Base de données

### Structure de la table `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Localisation
- Fichier SQLite : `auth-service/auth.db`
- Création automatique au premier démarrage
- Aucune configuration supplémentaire requise

## 🔧 Configuration

### Variables d'environnement
```bash
# Port du serveur (défaut: 3001)
PORT=3001

# Adresse d'écoute (défaut: 0.0.0.0)
HOST=0.0.0.0

# Clé secrète JWT (OBLIGATOIRE en production)
JWT_SECRET=votre-cle-secrete-ultra-forte

# Environnement (development/production)
NODE_ENV=development
```

### Configuration CORS
En développement : toutes les origines autorisées  
En production : seules les URLs spécifiées sont autorisées

## 📚 Concepts pour débutants

### Qu'est-ce qu'une API REST ?
Une API REST (Representational State Transfer) est une interface qui permet à différentes applications de communiquer entre elles via HTTP. Elle utilise des URLs (endpoints) et des méthodes HTTP (GET, POST, PUT, DELETE) pour effectuer des opérations.

### Qu'est-ce que JWT ?
JWT (JSON Web Token) est un standard pour créer des tokens d'accès qui permettent de sécuriser les API. C'est comme un "badge" numérique qui prouve votre identité.

### Qu'est-ce que le hashage ?
Le hashage transforme un mot de passe en une chaîne illisible et irréversible. Même si quelqu'un accède à la base de données, il ne peut pas voir les vrais mots de passe.

### Qu'est-ce qu'un middleware ?
Un middleware est une fonction qui s'exécute entre la réception d'une requête et l'envoi de la réponse. Il peut vérifier l'authentification, valider des données, etc.

## 🐛 Gestion des erreurs

### Codes d'erreur courants

| Code | Signification | Exemple |
|------|---------------|---------|
| 400 | Données invalides | Email mal formaté |
| 401 | Non autorisé | Token manquant ou invalide |
| 409 | Conflit | Email déjà utilisé |
| 500 | Erreur serveur | Problème de base de données |

### Exemple d'erreur
```json
{
  "error": "Données manquantes",
  "message": "L'email et le mot de passe sont obligatoires"
}
```

## 🧪 Tests

### Test rapide avec curl
```bash
# 1. Tester le service
curl http://localhost:3001/health

# 2. Créer un compte
curl -X POST http://localhost:3001/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@test.com","password":"test123"}'

# 3. Se connecter
curl -X POST http://localhost:3001/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@test.com","password":"test123"}'

# 4. Utiliser le token reçu pour accéder au profil
curl -X GET http://localhost:3001/profile \\
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

## 🛠️ Développement

### Structure du code
- **server.js** : Point d'entrée, configuration Fastify
- **config/database.js** : Gestion SQLite et création des tables
- **models/User.js** : Logique métier pour les utilisateurs
- **routes/auth.js** : Définition des endpoints
- **middleware/auth.js** : Vérification des tokens JWT

### Ajout de nouvelles fonctionnalités
1. Créer de nouvelles routes dans `routes/`
2. Ajouter la logique métier dans `models/`
3. Créer des middlewares dans `middleware/` si nécessaire
4. Enregistrer les nouvelles routes dans `server.js`

## 🚨 Bonnes pratiques

1. **Ne jamais** commiter la clé secrète JWT
2. **Toujours** valider les données d'entrée
3. **Toujours** hasher les mots de passe
4. **Ne jamais** retourner les mots de passe dans les réponses
5. **Utiliser HTTPS** en production
6. **Mettre à jour** les dépendances régulièrement

## 🆘 Dépannage

### Le serveur ne démarre pas
- Vérifiez que Node.js est installé : `node --version`
- Vérifiez que les dépendances sont installées : `npm install`
- Vérifiez que le port 3001 n'est pas déjà utilisé

### Erreur de base de données
- Supprimez le fichier `auth.db` et redémarrez (⚠️ perte des données)
- Vérifiez les permissions du dossier

### Token invalide
- Vérifiez le format : `Authorization: Bearer <token>`
- Le token expire après 24h, reconnectez-vous
- Vérifiez que la clé secrète JWT est correcte

## 📞 Support

Pour toute question ou problème :
1. Consultez cette documentation
2. Vérifiez les logs du serveur
3. Testez avec les exemples curl fournis
4. Contactez l'équipe de développement

---

🎯 **Objectif atteint** : Vous avez maintenant un microservice d'authentification complet et fonctionnel !