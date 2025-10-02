import './database/usersDatabase.js'
import Fastify from 'fastify'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from 'fastify-type-provider-zod'
import { usersRoutes } from './routes/usersRoutes.js'
import { UsersServices } from './services/usersServices.js'

const app = Fastify({
	logger: false,
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Register routes
app.register(usersRoutes)

const initializeUsers = async () => {
	console.log('Initializing users from auth service...')
	await UsersServices.syncAllUsersFromAuth()
	console.log('User initialization complete.')
}

const start = async () => {
	try {
		await initializeUsers()
		await app.listen({ port: 3000, host: '0.0.0.0' })
		console.log('Listening on port 3000')
	} catch (err) {
		console.error('Error starting server: ', err)
		process.exit(1)
	}
}

start()

// import DatabaseConstructor from 'better-sqlite3'
// import type { Database } from 'better-sqlite3'
//
// // On annote explicitement le type de 'database' pour résoudre l'erreur TS4023.
// // L'export reste 'database', donc 'index.ts' n'est pas impacté.
// const database: Database = new DatabaseConstructor('database.sqlite')
//
// database.exec(
//     'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT UNIQUE, name TEXT, password TEXT)'
// )
//
// // créer le serveur
// const app = Fastify({
//   logger: false,
// })
//
// //REPOSITORY - lib de requete SQL
// function getAllUsersRepo() {
//   const stmt = database.prepare('SELECT id, login, name FROM users').all()
//   return stmt
// }
//
// function addUserRepo(login: string, name: string, password: string) {
//   const stmt = database.prepare(
//       'INSERT INTO users (login, name, password) VALUES (?, ?, ?)'
//   )
//   return stmt.run(login, name, password)
// }
//
// function deleteUserRepo(login: string) {
//   const stmt = database.prepare('DELETE FROM users WHERE login = ?')
//   return stmt.run(login)
// }
//
// // SERVICE BACK - fonction logique metier
// function fetchAllUsers() {
//   return getAllUsersRepo()
// }
//
// function addUser(login: string, name: string, password: string) {
//   return addUserRepo(login, name, password)
// }
//
// function deleteUser(login: string) {
//   return deleteUserRepo(login)
// }
//
// // CONTROLLER - ROUTER - definir une route en callback
// app.get('/', (req, res) => {
//   res.send('heho michel!')
// })
//

// app.get('/users', (req, res) => {

//   try {
//     const users = fetchAllUsers()
//     res.send(users)
//   } catch (e) {
//     console.error(e)
//   }
// })
// //
// app.post('/users/add', (req, res) => {
//   try {
//     const { login, name, password } = req.body as {
//       login: string
//       name: string
//       password: string
//     }
//     const result = addUser(login, name, password)
//     res.status(201).send({ success: true, result: result })
//   } catch (e) {
//     console.error(e)
//     res.status(500).send({ error: 'An error occurred' })
//   }
// })
//
// app.delete('/users/delete', (req, res) => {
//   try {
//     const { login } = req.body as { login: string }
//     const result = deleteUser(login)
//     res.status(204).send({ success: true, result: result.changes })
//   } catch (e) {
//     console.error(e)
//   }
// })
//
// // variable pour lancer le serveur
// const start = async () => {
//   try {
//     await app.listen({ port: 3000, host: '0.0.0.0' })
//     console.log('Listening on port 3000')
//   } catch (err) {
//     console.error('Error starting server: ', err)
//     process.exit(1)
//   }
// }
//
// // lancer le serveur
// start()
