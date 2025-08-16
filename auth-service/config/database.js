// Configuration de la base de données SQLite
// Ce fichier gère la connexion à la base de données et la création automatique des tables

import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Obtenir le chemin du répertoire actuel (nécessaire pour les modules ES6)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chemin vers le fichier de base de données SQLite
const DB_PATH = join(__dirname, '..', 'auth.db')

// Variable pour stocker la connexion à la base de données
let db = null

/**
 * Initialise la connexion à la base de données SQLite
 * Crée automatiquement la table users si elle n'existe pas
 * @returns {Promise<sqlite3.Database>} La connexion à la base de données
 */
export async function initDatabase() {
  return new Promise((resolve, reject) => {
    // Créer une nouvelle connexion SQLite
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Erreur lors de la connexion à la base de données:', err.message)
        reject(err)
        return
      }
      
      console.log('Connexion réussie à la base de données SQLite')
      
      // Créer la table users si elle n'existe pas
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      db.run(createTableQuery, (err) => {
        if (err) {
          console.error('Erreur lors de la création de la table users:', err.message)
          reject(err)
          return
        }
        
        console.log('Table users créée ou vérifiée avec succès')
        resolve(db)
      })
    })
  })
}

/**
 * Obtient la connexion à la base de données
 * @returns {sqlite3.Database} La connexion à la base de données
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Base de données non initialisée. Appelez initDatabase() d\'abord.')
  }
  return db
}

/**
 * Ferme la connexion à la base de données
 * @returns {Promise<void>}
 */
export async function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Erreur lors de la fermeture de la base de données:', err.message)
          reject(err)
          return
        }
        
        console.log('Connexion à la base de données fermée')
        db = null
        resolve()
      })
    } else {
      resolve()
    }
  })
}