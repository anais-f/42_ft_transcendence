// Serveur principal du microservice d'authentification
// Ce fichier configure et démarre le serveur Fastify avec toutes les fonctionnalités

import Fastify from 'fastify'
import cors from '@fastify/cors'
import { initDatabase, closeDatabase } from './config/database.js'
import authRoutes from './routes/auth.js'

// Configuration du serveur
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'

/**
 * Fonction principale pour créer et configurer le serveur Fastify
 * @returns {Object} L'instance du serveur Fastify configurée
 */
async function createServer() {
  // Créer une instance Fastify avec des options de configuration
  const fastify = Fastify({
    // Activer les logs détaillés pour le développement
    logger: {
      level: 'info'
    }
  })
  
  try {
    // Enregistrer le plugin CORS pour permettre les requêtes cross-origin
    await fastify.register(cors, {
      // Permettre les requêtes depuis n'importe quelle origine en développement
      // En production, spécifiez les domaines autorisés
      origin: process.env.NODE_ENV === 'production' 
        ? ['http://localhost:8080', 'http://localhost:3000'] // URLs de production
        : true, // Toutes les origines en développement
      
      // Méthodes HTTP autorisées
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      
      // En-têtes autorisés
      allowedHeaders: ['Content-Type', 'Authorization'],
      
      // Permettre l'envoi des cookies
      credentials: true
    })
    
    // Enregistrer les routes d'authentification
    await fastify.register(authRoutes)
    
    // Route de base pour vérifier que le serveur fonctionne
    fastify.get('/', async (request, reply) => {
      return {
        message: 'Microservice d\'authentification ft_transcendence',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: 'GET /health',
          register: 'POST /register',
          login: 'POST /login',
          profile: 'GET /profile (protected)'
        }
      }
    })
    
    // Gestionnaire d'erreur global
    fastify.setErrorHandler(async (error, request, reply) => {
      fastify.log.error(error)
      
      // Erreurs de validation Fastify
      if (error.validation) {
        reply.code(400).send({
          error: 'Erreur de validation',
          message: 'Les données fournies ne respectent pas le format attendu',
          details: error.validation
        })
        return
      }
      
      // Erreur générique
      reply.code(500).send({
        error: 'Erreur interne du serveur',
        message: 'Une erreur inattendue s\'est produite'
      })
    })
    
    // Gestionnaire pour les routes non trouvées
    fastify.setNotFoundHandler(async (request, reply) => {
      reply.code(404).send({
        error: 'Route non trouvée',
        message: `La route ${request.method} ${request.url} n'existe pas`,
        availableRoutes: [
          'GET /',
          'GET /health',
          'POST /register',
          'POST /login',
          'GET /profile'
        ]
      })
    })
    
    return fastify
    
  } catch (error) {
    fastify.log.error('Erreur lors de la configuration du serveur:', error)
    throw error
  }
}

/**
 * Fonction principale pour démarrer le serveur
 */
async function start() {
  let fastify = null
  
  try {
    // Initialiser la base de données
    console.log('🗄️  Initialisation de la base de données...')
    await initDatabase()
    
    // Créer et configurer le serveur
    console.log('⚙️  Configuration du serveur...')
    fastify = await createServer()
    
    // Démarrer le serveur
    console.log(`🚀 Démarrage du serveur sur ${HOST}:${PORT}...`)
    await fastify.listen({ port: PORT, host: HOST })
    
    console.log(`✅ Serveur d'authentification démarré avec succès!`)
    console.log(`📍 URL: http://${HOST}:${PORT}`)
    console.log(`📚 Documentation: Consultez le README.md pour les exemples d'utilisation`)
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error)
    
    // Nettoyer les ressources en cas d'erreur
    if (fastify) {
      await fastify.close()
    }
    await closeDatabase()
    
    process.exit(1)
  }
}

/**
 * Gestionnaire pour l'arrêt propre du serveur
 */
async function gracefulShutdown(signal) {
  console.log(`\\n📡 Signal ${signal} reçu, arrêt du serveur...`)
  
  try {
    // Fermer la base de données
    await closeDatabase()
    console.log('✅ Base de données fermée')
    
    // Le serveur Fastify se fermera automatiquement
    console.log('✅ Serveur arrêté proprement')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'arrêt:', error)
    process.exit(1)
  }
}

// Écouter les signaux d'arrêt pour un arrêt propre
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Démarrer le serveur
start()