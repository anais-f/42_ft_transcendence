// Modèle User pour la gestion des utilisateurs
// Ce fichier contient toutes les fonctions pour interagir avec la table users

import bcrypt from 'bcryptjs'
import { getDatabase } from '../config/database.js'

/**
 * Crée un nouvel utilisateur dans la base de données
 * @param {string} email - L'adresse email de l'utilisateur
 * @param {string} password - Le mot de passe en clair (sera hashé automatiquement)
 * @returns {Promise<Object>} L'utilisateur créé (sans le mot de passe)
 */
export async function createUser(email, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = getDatabase()
      
      // Hacher le mot de passe avec bcrypt (salt rounds = 12 pour une sécurité élevée)
      const hashedPassword = await bcrypt.hash(password, 12)
      
      // Insérer le nouvel utilisateur dans la base de données
      const query = 'INSERT INTO users (email, password) VALUES (?, ?)'
      
      db.run(query, [email, hashedPassword], function(err) {
        if (err) {
          // Gestion des erreurs spécifiques
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            reject(new Error('Un utilisateur avec cette adresse email existe déjà'))
          } else {
            reject(new Error('Erreur lors de la création de l\'utilisateur: ' + err.message))
          }
          return
        }
        
        // Récupérer l'utilisateur créé (sans le mot de passe pour des raisons de sécurité)
        const newUser = {
          id: this.lastID,
          email: email,
          created_at: new Date().toISOString()
        }
        
        console.log('Nouvel utilisateur créé avec l\'ID:', this.lastID)
        resolve(newUser)
      })
      
    } catch (error) {
      reject(new Error('Erreur lors du hashage du mot de passe: ' + error.message))
    }
  })
}

/**
 * Trouve un utilisateur par son adresse email
 * @param {string} email - L'adresse email à rechercher
 * @returns {Promise<Object|null>} L'utilisateur trouvé ou null si non trouvé
 */
export async function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    
    const query = 'SELECT * FROM users WHERE email = ?'
    
    db.get(query, [email], (err, row) => {
      if (err) {
        reject(new Error('Erreur lors de la recherche de l\'utilisateur: ' + err.message))
        return
      }
      
      // Retourner l'utilisateur trouvé ou null si aucun utilisateur trouvé
      resolve(row || null)
    })
  })
}

/**
 * Trouve un utilisateur par son ID
 * @param {number} id - L'ID de l'utilisateur à rechercher
 * @returns {Promise<Object|null>} L'utilisateur trouvé (sans le mot de passe) ou null
 */
export async function findUserById(id) {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    
    // Sélectionner l'utilisateur sans le mot de passe pour des raisons de sécurité
    const query = 'SELECT id, email, created_at FROM users WHERE id = ?'
    
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(new Error('Erreur lors de la recherche de l\'utilisateur: ' + err.message))
        return
      }
      
      // Retourner l'utilisateur trouvé ou null si aucun utilisateur trouvé
      resolve(row || null)
    })
  })
}

/**
 * Vérifie si un mot de passe correspond au hash stocké
 * @param {string} plainPassword - Le mot de passe en clair à vérifier
 * @param {string} hashedPassword - Le mot de passe hashé stocké en base
 * @returns {Promise<boolean>} True si le mot de passe correspond, false sinon
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  try {
    // Utiliser bcrypt pour comparer le mot de passe en clair avec le hash
    return await bcrypt.compare(plainPassword, hashedPassword)
  } catch (error) {
    throw new Error('Erreur lors de la vérification du mot de passe: ' + error.message)
  }
}