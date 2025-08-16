// Routes d'authentification
// Ce fichier contient toutes les routes liées à l'authentification

import { createUser, findUserByEmail, verifyPassword } from '../models/User.js'
import { generateToken, authenticateToken } from '../middleware/auth.js'

/**
 * Plugin des routes d'authentification pour Fastify
 * @param {Object} fastify - L'instance Fastify
 * @param {Object} options - Options du plugin (non utilisées ici)
 */
export default async function authRoutes(fastify, options) {
  
  /**
   * Route d'inscription
   * POST /register
   * Crée un nouveau compte utilisateur
   */
  fastify.post('/register', {
    // Schéma de validation des données d'entrée
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Adresse email valide'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Mot de passe (minimum 6 caractères)'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                created_at: { type: 'string' }
              }
            },
            token: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password } = request.body
      
      // Validation supplémentaire côté serveur
      if (!email || !password) {
        reply.code(400).send({
          error: 'Données manquantes',
          message: 'L\'email et le mot de passe sont obligatoires'
        })
        return
      }
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await findUserByEmail(email)
      if (existingUser) {
        reply.code(409).send({
          error: 'Utilisateur existant',
          message: 'Un compte avec cette adresse email existe déjà'
        })
        return
      }
      
      // Créer le nouvel utilisateur
      const newUser = await createUser(email, password)
      
      // Générer un token JWT pour l'utilisateur
      const token = generateToken(newUser)
      
      // Envoyer la réponse de succès
      reply.code(201).send({
        message: 'Compte créé avec succès',
        user: newUser,
        token: token
      })
      
    } catch (error) {
      fastify.log.error('Erreur lors de l\'inscription:', error)
      reply.code(500).send({
        error: 'Erreur serveur',
        message: error.message
      })
    }
  })
  
  /**
   * Route de connexion
   * POST /login
   * Authentifie un utilisateur et retourne un token JWT
   */
  fastify.post('/login', {
    // Schéma de validation des données d'entrée
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Adresse email'
          },
          password: {
            type: 'string',
            description: 'Mot de passe'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                created_at: { type: 'string' }
              }
            },
            token: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password } = request.body
      
      // Validation des données
      if (!email || !password) {
        reply.code(400).send({
          error: 'Données manquantes',
          message: 'L\'email et le mot de passe sont obligatoires'
        })
        return
      }
      
      // Trouver l'utilisateur par email
      const user = await findUserByEmail(email)
      if (!user) {
        reply.code(401).send({
          error: 'Identifiants invalides',
          message: 'Email ou mot de passe incorrect'
        })
        return
      }
      
      // Vérifier le mot de passe
      const isValidPassword = await verifyPassword(password, user.password)
      if (!isValidPassword) {
        reply.code(401).send({
          error: 'Identifiants invalides',
          message: 'Email ou mot de passe incorrect'
        })
        return
      }
      
      // Créer l'objet utilisateur sans le mot de passe
      const userResponse = {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
      
      // Générer un token JWT
      const token = generateToken(userResponse)
      
      // Envoyer la réponse de succès
      reply.code(200).send({
        message: 'Connexion réussie',
        user: userResponse,
        token: token
      })
      
    } catch (error) {
      fastify.log.error('Erreur lors de la connexion:', error)
      reply.code(500).send({
        error: 'Erreur serveur',
        message: 'Une erreur s\'est produite lors de la connexion'
      })
    }
  })
  
  /**
   * Route du profil utilisateur (protégée)
   * GET /profile
   * Retourne les informations du profil de l'utilisateur connecté
   */
  fastify.get('/profile', {
    // Utiliser le middleware d'authentification pour cette route
    preHandler: [authenticateToken],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                created_at: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // L'utilisateur est déjà disponible dans request.user grâce au middleware
      reply.code(200).send({
        message: 'Profil récupéré avec succès',
        user: request.user
      })
      
    } catch (error) {
      fastify.log.error('Erreur lors de la récupération du profil:', error)
      reply.code(500).send({
        error: 'Erreur serveur',
        message: 'Une erreur s\'est produite lors de la récupération du profil'
      })
    }
  })
  
  /**
   * Route de test pour vérifier que l'API fonctionne
   * GET /health
   * Route publique pour vérifier l'état du service
   */
  fastify.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    reply.code(200).send({
      status: 'OK',
      message: 'Service d\'authentification opérationnel',
      timestamp: new Date().toISOString()
    })
  })
}