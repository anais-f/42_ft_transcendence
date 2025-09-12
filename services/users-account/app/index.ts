import Fastify from 'fastify'
import DatabaseConstructor from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

// On annote explicitement le type de 'db' pour résoudre l'erreur TS4023.
// L'export reste 'db', donc 'index.ts' n'est pas impacté.
const db: Database = new DatabaseConstructor('db.sqlite')

db.exec(
	'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT UNIQUE, name TEXT, password TEXT)'
)
// const stmt = db.prepare('INSERT OR IGNORE INTO users (login, name, password) VALUES (?, ?, ?)');
//
// stmt.run('anfichet', 'anais fichet', 'passwd');
// stmt.run('acancel', 'adrien cancel', 'passwd');
// stmt.run('lrio', 'loic rio', 'passwd');
// stmt.run('mjuffard', 'michel juffard', 'passwd');




// créer le serveur
const app = Fastify({
  logger: false,
});


//REPOSITORY - lib de requete SQL
function getAllUsersRepo() {
  const stmt = db.prepare("SELECT id, login, name FROM users").all();
  return stmt;
}

function addUserRepo(login: string, name: string, password: string) {
  const stmt = db.prepare("INSERT INTO users (login, name, password) VALUES (?, ?, ?)");
  return stmt.run(login, name, password);
}

function deleteUserRepo(login: string) {
  const stmt = db.prepare("DELETE FROM users WHERE login = ?");
  return stmt.run(login);
}

// SERVICE BACK - fonction logique metier
function fetchAllUsers() {
  return getAllUsersRepo();
}

function addUser(login: string, name: string, password: string) {
  return addUserRepo(login, name, password);
}

function deleteUser(login: string) {
  return deleteUserRepo(login);
}

// CONTROLLER - ROUTER - definir une route en callback
app.get('/', (req, res) => {
  res.send("heho michel!");
})

app.get('/users', (req, res) => {
  try {
    const users = fetchAllUsers();
    res.send(users);
  }
  catch (e) {
    console.error(e);
  }
})

app.post('/users/add', (req, res) => {
  try {
    const { login, name, password } = req.body as { login: string; name: string; password: string };
    const result = addUser(login, name, password);
    res.status(201).send({ success: true, result: result });
  }
  catch (e) {
    console.error(e);
    res.status(500).send({ error: "An error occurred" });
  }
})

app.delete('/users/delete', (req, res) => {
  try {
    const { login } = req.body as { login: string };
    const result = deleteUser(login)
    res.status(204).send({ success: true, result: result.changes });
  }
  catch (e) {
    console.error(e);
  }
})

// variable pour lancer le serveur
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Listening on port 3000');
  } catch (err) {
    console.error('Error strating server: ', err);
    process.exit(1);
  }
}

/* on pourrait faire pour le lancer, callback !
app.listen({ port: 3000 }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
 */

// lancer le serveur
start();

