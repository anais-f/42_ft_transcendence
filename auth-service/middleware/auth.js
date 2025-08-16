// Middleware d'authentification JWT
// Ce fichier contient le middleware pour vérifier les tokens JWT et protéger les routes

import jwt from 'jsonwebtoken'
import { findUserById } from '../models/User.js'

// Clé secrète pour signer les tokens JWT (en production, utilisez une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'votre-cle-secrete-super-forte-pour-jwt-en-production-utilisez-une-variable-environnement'

// Durée de validité des tokens (24 heures)
const JWT_EXPIRES_IN = '24h'

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user - L'objet utilisateur (doit contenir au minimum l'ID)
 * @returns {string} Le token JWT signé
 */
export function generateToken(user) {
  try {
    // Créer le payload du token (ne jamais inclure le mot de passe)
    const payload = {
      id: user.id,
      email: user.email
    }
    
    // Signer le token avec la clé secrète et définir une expiration
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'auth-service', // Qui a émis le token
      audience: 'ft_transcendence' // Pour qui le token est destiné
    })
    
    return token
  } catch (error) {
    throw new Error('Erreur lors de la génération du token: ' + error.message)
  }
}

/**
 * Middleware d'authentification pour Fastify
 * Vérifie la présence et la validité du token JWT dans l'en-tête Authorization
 * @param {Object} request - L'objet request de Fastify
 * @param {Object} reply - L'objet reply de Fastify
 */
export async function authenticateToken(request, reply) {
  try {
    // Récupérer l'en-tête Authorization
    const authHeader = request.headers.authorization
    
    // Vérifier si l'en-tête Authorization est présent et au bon format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({
        error: 'Accès non autorisé',
        message: 'Token d\'authentification manquant ou format invalide. Format attendu: "Bearer <token>"'
      })
      return
    }
    
    // Extraire le token (supprimer "Bearer " du début)
    const token = authHeader.substring(7)
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Récupérer les informations complètes de l'utilisateur depuis la base de données
    const user = await findUserById(decoded.id)
    
    if (!user) {
      reply.code(401).send({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur associé à ce token n\'existe plus'
      })
      return
    }
    
    // Ajouter les informations de l'utilisateur à l'objet request
    // Cela permet aux routes protégées d'accéder aux infos de l'utilisateur connecté
    request.user = user
    
    // Continuer vers la route suivante
    
  } catch (error) {
    // Gestion des différents types d'erreurs JWT
    if (error.name === 'TokenExpiredError') {
      reply.code(401).send({
        error: 'Token expiré',
        message: 'Votre session a expiré, veuillez vous reconnecter'
      })
    } else if (error.name === 'JsonWebTokenError') {
      reply.code(401).send({
        error: 'Token invalide',
        message: 'Le token d\'authentification est invalide'
      })
    } else if (error.name === 'NotBeforeError') {
      reply.code(401).send({
        error: 'Token pas encore valide',
        message: 'Ce token n\'est pas encore valide'
      })
    } else {
      reply.code(500).send({
        error: 'Erreur d\'authentification',
        message: 'Une erreur s\'est produite lors de la vérification de votre authentification'
      })
    }
  }
}

/**
 * Version simplifiée du middleware d'authentification pour une utilisation directe
 * @param {string} token - Le token à vérifier
 * @returns {Promise<Object>} L'utilisateur décodé du token
 */
export async function verifyToken(token) {
  try {
    // Décoder et vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await findUserById(decoded.id)
    
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    return user
  } catch (error) {
    throw new Error('Token invalide: ' + error.message)
  }
}