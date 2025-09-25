import Fastify from 'fastify'
import DatabaseConstructor from 'better-sqlite3';
import type { Database } from 'better-sqlite3';


// On annote explicitement le type de 'db' pour résoudre l'erreur TS4023.
// L'export reste 'db', donc 'index.ts' n'est pas impacté.
const db: Database = new DatabaseConstructor('./db.sqlite')

db.exec(
    'CREATE TABLE IF NOT EXISTS users (id_user INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)'
)

const stmt = db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)');
stmt.run('anfichet', 'passwd');
stmt.run('acancel', 'passwd');
stmt.run('lrio', 'passwd');
stmt.run('mjuffard', 'passwd');



const app = Fastify({
  logger: false,
})

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Listening on port 3000')
  } catch (err) {
    console.error('Error starting server: ', err)
    process.exit(1)
  }
}

start()
