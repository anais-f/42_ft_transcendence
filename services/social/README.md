# `'/api/create-token'` endpoint

This endpoint is used to create a new authentication token for a user. It requires the user to be authenticated and will return a token that can be used for subsequent requests.
Le client fait la requête avec son cookie httpOnly pour prouver son identité via le JWT.
Le preHandler vérifie le JWT et ajoute l'ID utilisateur à la requête -> jwt.verify() extrait le token, verifie sa validité et décode son conten puis le met dans request.user.

Route pour générer le token temporaire (POST /api/ws/token)
Validation du token dans le WebSocket (extraire + vérifier)
Map pour stocker les connexions par user_id
Fonction helper pour envoyer à un user
Tester avec plusieurs connexions simultanées
Implémenter les notifications (friend requests, game invites)

Je vais te proposer une roadmap claire et concrète pour la suite : implémenter la "map" des connexions (gestion des sockets par user_id) puis toutes les briques adjacentes nécessaires pour que ce soit robuste et prêt à monter en charge.
Checklist (petits pas)
Choisir la structure de stockage en mémoire pour les connexions.
Ajouter / retirer une connexion à la Map à la connexion / fermeture.
Fournir des helpers : sendToUser, sendToSocket, broadcast, countConnections.
Gérer la détection des sockets morts (heartbeat / ping-pong).
Gérer la sécurité / replay token (optionnel) : jti ou blacklist temporaire.
Tests manuels (Postman / 2 onglets) et unitaires simples.
Préparer la montée en charge / multi-instance (Redis pub/sub) si besoin.
Détail étape‑par‑étape

Choix de la structure en mémoire
Recommandé : Map<number, Map<string, ConnInfo>> ou Map<number, Set<conninfo>>.
clé 1 : userId (number)
clé interne : socketId (string, ex. uuid) — permet d’identifier et retirer précisément un socket (multi-onglets).
ConnInfo contient : socket (WebSocket), connectedAt (Date), ip, userAgent, lastSeen (timestamp), optional jtiUsed bool.
</conninfo>
Exemple conceptuel :
connectedUsers: Map<number, Map<string, ConnInfo>>

À la connexion : ajouter la socket
Générer un socketId (uuid ou compteur).
Créer ConnInfo et stocker sous connectedUsers.get(userId).set(socketId, connInfo)
Lier handlers socket.on('close'), socket.on('error') et socket.on('pong') à fonctions qui mettent à jour lastSeen et suppriment la socket à la fermeture.
Optionnel : si token WS doit être one‑time, marquer jti utilisé (voir point 5).

À la fermeture / erreur : retirer la socket
Dans socket.on('close'|'error'), faire :
connectedUsers.get(userId)?.delete(socketId)
si map vide => connectedUsers.delete(userId)
Log utile et métriques (nbr connexions par user).

Helpers d’envoi
sendToUser(userId, message)
récupère la map interne et itère sur chaque ConnInfo.socket.send(JSON.stringify(message))
sendToSocket(userId, socketId, message)
broadcastExcept(userId, message) — utile pour inviter touts les autres devices

Ces fonctions doivent gérer try/catch autour de socket.send et retirer sockets mort(e)s.
Heartbeat / détection de dead sockets (important)

Mettre en place un mécanisme périodique (ex. setInterval toutes les 30s) :
pour chaque ConnInfo, if Date.now() - lastSeen > threshold (ex. 60s) => socket.terminate() / remove
utiliser WebSocket ping/pong : server envoie ping, socket.on('pong') met à jour lastSeen
Cela évite les fuites mémoire quand le client ferme l’onglet brutalement.

Gestion des tokens temporaires / replay
Option 1 (facile) : accepter que JWT temporaire expire rapidement (30s). Risque de replay faible.
Option 2 (plus sûr) : inclure un claim jti dans le wsToken et stocker jti dans une Set en mémoire après usage (invalider le jti pour éviter reuse).
Problème : si tu as plusieurs instances, la Set doit être partagée (Redis).

Implémentation recommandée pour dev : mémoire + TTL cleanup. Pour prod distribué : Redis SET + expire.
Edge cases et limites
Plusieurs sockets par user (mobile + desktop) → la Map gère ça. Décider politiques (max sockets/ user) et rate‑limit.

Reconnexion rapide : si token court expire pendant handshake → renvoyer code d’erreur clair et le client régénère un token.
Slow clients / backpressure : vérifier send errors et buffer.
Graceful shutdown : lors d’un shutdown, itérer et close() tous les sockets proprement.

Tests à faire (manuel + automatisé)
Manuel : ouvrir 2 onglets / postman websocket / deux devices → vérifier que les deux connexions apparaissent et que sendToUser envoie aux deux.
Test unitaire : simuler ConnInfo avec mock socket (promise-based send), tester add/remove et helpers sendToUser.
Test de charge simple : script Node qui ouvre N websockets avec tokens valides et vérifie réponses.
Montée en charge / multi-instance
Si tu déploies plusieurs réplicas social service :
besoin d’un canal global pour envoyer à un user qui peut être connecté sur un autre processus. Solution : Redis pub/sub (channel par userId ou topic generic) ou un message broker (NATS, Kafka).
pattern : chaque instance publie sur Redis channel "user:{id}" et les autres instances abonnées transmettent aux sockets locales de ce userId.
alternative : centraliser websocket dans un service dédié (socket gateway).

Intégration observability & sécurité

Logs structurés à chaque connexion/déconnexion et échec auth.
Metrics : nombre connexions actives, messages/s, avg latency.
Surveiller les tokens expirés / tentatives failed auth (rate-limit/block IP).
Exemple minimal de fonctions (pseudocode TypeScript — pour t’orienter, pas à coller tel quel)
addConnection(userId, socket): returns socketId
removeConnection(userId, socketId)
sendToUser(userId, payload)
cleanupExpired()

Points pratiques pour ton code actuel
À l'endroit où tu as // Étape 5 : Gérer la connexion WebSocket :
crée un socketId, appelle addConnection(userId, socket)
dans socket.on('close') appelle removeConnection(userId, socketId)
Question sur le token one‑time
Veux‑tu protéger contre le replay token (jti) maintenant ? Si oui, je te décris comment ajouter le jti dans le JWT temporaire et la blacklist mémoire/Redis. Si non, on garde le flow simple (30s) et on avance.
Veux-tu que je te fournisse (1) le pseudo‑code détaillé pour chaque helper, (2) un plan d’implémentation précis des tests, ou (3) que j’implémente directement la Map dans ton code et les helpers ?
