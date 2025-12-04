// import Fastify from 'fastify'
// import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
// import type { Database } from 'better-sqlite3'
// import BetterSqlite3 from 'better-sqlite3'
// import { mkdirSync } from 'fs'
// import { dirname } from 'path'
// import {
// 	ZodTypeProvider,
// 	validatorCompiler,
// 	serializerCompiler,
// 	jsonSchemaTransform
// } from 'fastify-type-provider-zod'
// import { setupFastifyMonitoringHooks } from '@ft_transcendence/monitoring'
// import metricPlugin from 'fastify-metrics'
// import Swagger from '@fastify/swagger'
// import SwaggerUI from '@fastify/swagger-ui'
// import fs from 'fs'
// import {
// 	CreateTournamentSchema,
// 	IdParamSchema,
// 	RemoveTournamentSchema
// } from '@ft_transcendence/common'
// import {
// 	jwtAuthMiddleware,
// 	jwtAuthOwnerMiddleware
// } from '@ft_transcendence/security'
// import fastifyJwt from '@fastify/jwt'
// import fastifyCookie from '@fastify/cookie'

// const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()
// const jwtSecret = process.env.JWT_SECRET
// if (!jwtSecret) {
// 	throw new Error('JWT_SECRET environment variable is required')
// }
// console.log('Using JWT Secret:', jwtSecret)
// app.setValidatorCompiler(validatorCompiler)
// app.setSerializerCompiler(serializerCompiler)

// app.register(fastifyCookie)
// app.register(fastifyJwt, {
// 	secret: jwtSecret,
// 	cookie: {
// 		cookieName: 'auth_token',
// 		signed: false
// 	}
// })

// setupFastifyMonitoringHooks(app)

// type MatchTournament = {
// 	previousMatchId1?: number
// 	previousMatchId2?: number
// 	round: number
// 	matchNumber: number
// 	player1Id?: number
// 	player2Id?: number
// 	status: 'pending' | 'ongoing' | 'completed' | 'waiting_for_players'
// 	scorePlayer1?: number
// 	scorePlayer2?: number
// }

// type Tournament = {
// 	id: number
// 	creatorId: number
// 	name: string
// 	status: 'pending' | 'ongoing' | 'finished'
// 	maxParticipants: number
// 	participants: number[]
// 	participantsBan: number[]
// 	matchs: MatchTournament[]
// }

// const tournaments: Map<number, Tournament> = new Map()
// let nextTournamentId = 1

// let db: Database

// function historyRoutes(app: FastifyInstance) {
// 	app.get(
// 		'/api/matchHisotry/:id',
// 		{ preHandler: jwtAuthMiddleware },
// 		getMatchHistoryController
// 	)
// }

// function tournamentRoutes(app: FastifyInstance) {
// 	app.post(
// 		'/api/createTournament',
// 		{
// 			schema: {
// 				body: CreateTournamentSchema
// 			},
// 			preHandler: jwtAuthMiddleware
// 		},
// 		createTournamentController
// 	)
// 	app.post(
// 		'/api/joinTournament/:id',
// 		{
// 			preHandler: jwtAuthMiddleware
// 		},
// 		joinTournamentController
// 	)
// 	app.post(
// 		'/api/removeFromTournament/:id',
// 		{
// 			schema: {
// 				body: RemoveTournamentSchema
// 			},
// 			preHandler: jwtAuthMiddleware
// 		},
// 		removeFromTournamentController
// 	)
// 	app.get(
// 		'/api/startTournament/:id' /*, { preHandler: jwtAuthMiddleware }*/,
// 		startTournamentController
// 	)
// 	app.get(
// 		'/api/tournament/:id' /*, { preHandler: jwtAuthMiddleware }*/,
// 		getTournamentController
// 	)
// 	app.delete(
// 		'/api/tournament/:id' /*, { preHandler: jwtAuthOwnerMiddleware }*/,
// 		deleteTournamentController
// 	)
// }

// function getMatchHistoryController(
// 	request: FastifyRequest,
// 	reply: FastifyReply
// ) {
// 	const userId = request.user.user_id
// 	if (userId === undefined) {
// 		return reply.status(401).send({ error: 'Unauthorized' })
// 	}
// 	const matchId = IdParamSchema.parse(request.params)
// 	const db = getDb()
// 	const match = db
// 		.prepare(
// 			`
// 		SELECT mh.id_match, mh.winner_id, mh.played_at, mp.player_id, mp.score
// 		FROM match_history mh
// 		JOIN match_player mp ON mh.id_match = mp.id_match
// 		WHERE mh.id_match = ? AND (mp.player_id = ? OR mh.winner_id = ?)
// 	`
// 		)
// 		.all(matchId.id, userId, userId)
// 	if (match.length === 0) {
// 		return reply.status(404).send({ error: 'Match not found or access denied' })
// 	}
// 	return reply.send({ success: true, match })
// }

// function deleteTournamentController(
// 	request: FastifyRequest,
// 	reply: FastifyReply
// ) {
// 	const userId = request.user.user_id
// 	if (userId === undefined) {
// 		return reply.status(401).send({ error: 'Unauthorized' })
// 	}
// 	const tournamentId = IdParamSchema.parse(request.params)
// 	const tournament = tournaments.get(Number(tournamentId.id))
// 	if (!tournament) {
// 		return reply.status(404).send({ error: 'Tournament not found' })
// 	}
// 	if (userId != tournament.creatorId)
// 		return reply
// 			.status(403)
// 			.send({ error: 'Only the creator can delete the tournament' })
// 	tournaments.delete(tournament.id)
// 	return reply.send({ success: true })
// }

// function getTournamentController(request: FastifyRequest, reply: FastifyReply) {
// 	const userId = request.user.user_id
// 	if (userId === undefined) {
// 		return reply.status(401).send({ error: 'Unauthorized' })
// 	}
// 	const tournamentId = IdParamSchema.parse(request.params)
// 	const tournament = tournaments.get(Number(tournamentId.id))
// 	if (!tournament) {
// 		return reply.status(404).send({ error: 'Tournament not found' })
// 	}
// 	if (!tournament.participants.includes(userId)) {
// 		return reply.status(403).send({ error: 'Access denied to this tournament' })
// 	}
// 	return reply.send({ success: true, tournament })
// }

// const randomAlphaNumeric = (length: number) => {
// 	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
// 	let s = ''
// 	for (let i = 0; i < length; i++) {
// 		s += chars.charAt(Math.floor(Math.random() * chars.length))
// 	}
// 	return s
// }

// const createInviteCode = (): string => {
// 	const str1: string = randomAlphaNumeric(4)
// 	const str2: string = randomAlphaNumeric(4)
// 	for (const tournament of tournaments.values())
// 		if (tournament.name === str1 + '-' + str2) return createInviteCode()
// 	return str1 + '-' + str2
// }

// function removeFromTournamentController(
// 	request: FastifyRequest,
// 	reply: FastifyReply
// ) {
// 	const userId = request.user.user_id
// 	if (userId === undefined) {
// 		return reply.status(401).send({ error: 'Unauthorized' })
// 	}
// 	const tournamentId = IdParamSchema.parse(request.params)
// 	const parsed = RemoveTournamentSchema.safeParse(request.body)
// 	if (!parsed.success) {
// 		return reply.status(400).send({ error: parsed.error })
// 	}
// 	const tournament = tournaments.get(Number(tournamentId.id))
// 	if (!tournament) {
// 		return reply.status(404).send({ error: 'Tournament not found' })
// 	}
// 	if (userId != tournament.creatorId)
// 		return reply
// 			.status(403)
// 			.send({ error: 'Only the creator can remove participants' })
// 	const participantIndex = tournament.participants.indexOf(parsed.data.userId)
// 	if (participantIndex === -1) {
// 		return reply.status(400).send({ error: 'User is not in the tournament' })
// 	}
// 	tournament.participants.splice(participantIndex, 1)
// 	tournament.participantsBan.push(parsed.data.userId)
// 	return reply.send({ success: true, tournament })
// }

// function shuffle(array: any[]) {
// 	let currentIndex = array.length

// 	while (currentIndex != 0) {
// 		let randomIndex = Math.floor(Math.random() * currentIndex)
// 		currentIndex--
// 		;[array[currentIndex], array[randomIndex]] = [
// 			array[randomIndex],
// 			array[currentIndex]
// 		]
// 	}
// }

// function createTournamentTree(id: number) {
// 	const tournament = tournaments.get(id)
// 	if (!tournament) {
// 		throw new Error('Tournament not found')
// 	}
// 	console.log('Before shuffle:', tournament.participants)
// 	shuffle(tournament.participants)
// 	console.log('Shuffled participants:', tournament.participants)
// 	if (!tournament) {
// 		throw new Error('Tournament not found')
// 	}
// 	if (tournament.participants.length !== tournament.maxParticipants) {
// 		throw new Error('Not enough participants to create the tournament tree')
// 	}
// 	if (tournament.status !== 'ongoing') {
// 		throw new Error('Tournament is not ongoing')
// 	}
// 	let maxRound = Math.log2(tournament.maxParticipants)
// 	for (let match = 0; match < tournament.maxParticipants / 2; match++) {
// 		const player1Index = match * 2
// 		const player2Index = player1Index + 1
// 		const player1 = tournament.participants[player1Index]
// 		const player2 = tournament.participants[player2Index]
// 		tournament.matchs.push({
// 			round: maxRound,
// 			matchNumber: match,
// 			player1Id: tournament.participants[player1Index],
// 			player2Id: tournament.participants[player2Index],
// 			status: 'pending'
// 		})
// 	}
// 	for (let round = maxRound - 1; round > 0; --round) {
// 		const matchesInRound =
// 			tournament.maxParticipants / 2 ** (maxRound - round + 1)
// 		console.log(
// 			'Creating matches for round',
// 			round,
// 			'with',
// 			matchesInRound,
// 			'matches'
// 		)
// 		for (let match = 0; match < matchesInRound; match++) {
// 			tournament.matchs.push({
// 				previousMatchId1: match * 2,
// 				previousMatchId2: match * 2 + 1,
// 				round: round,
// 				matchNumber: match,
// 				status: 'waiting_for_players'
// 			})
// 		}
// 	}
// 	console.log('Tournament Matches:', tournament.matchs)
// 	console.log('Tournament tree created successfully')
// }

// function startTournamentController(
// 	request: FastifyRequest,
// 	reply: FastifyReply
// ) {
// 	const tournamentId = IdParamSchema.parse(request.params)
// 	const tournament = tournaments.get(Number(tournamentId.id))
// 	if (!tournament) {
// 		return reply.status(404).send({ error: 'Tournament not found' })
// 	}
// 	if (tournament.status !== 'pending') {
// 		return reply
// 			.status(400)
// 			.send({ error: 'Tournament has already started or finished' })
// 	}
// 	if (tournament.participants.length != tournament.maxParticipants) {
// 		return reply
// 			.status(400)
// 			.send({ error: 'Not enough participants to start the tournament' })
// 	}
// 	tournament.status = 'ongoing'
// 	createTournamentTree(tournament.id)
// 	return reply.send({ success: true, tournament })
// }

// function createTournamentController(
// 	request: FastifyRequest,
// 	reply: FastifyReply
// ) {
// 	const parsed = CreateTournamentSchema.safeParse(request.body)
// 	if (!parsed.success) {
// 		return reply.status(400).send({ error: parsed.error })
// 	}
// 	//verifier id creator
// 	for (const tournament of tournaments.values()) {
// 		for (const participant of tournament.participants) {
// 			if (participant === parsed.data.creatorId) {
// 				return reply
// 					.status(400)
// 					.send({ error: 'User is already in another tournament' })
// 			}
// 		}
// 	}
// 	tournaments.set(nextTournamentId, {
// 		id: nextTournamentId,
// 		creatorId: parsed.data.creatorId,
// 		name: createInviteCode(),
// 		status: 'pending',
// 		maxParticipants: parsed.data.numberOfPlayers,
// 		participants: [parsed.data.creatorId],
// 		participantsBan: [],
// 		matchs: []
// 	})
// 	return reply.send(tournaments.get(nextTournamentId++))
// }

// function joinTournamentController(
// 	request: FastifyRequest,
// 	reply: FastifyReply
// ) {
// 	const tournamentId = IdParamSchema.parse(request.params)
// 	const userId = request.user.user_id
// 	if (userId === undefined) {
// 		return reply.status(401).send({ error: 'Unauthorized' })
// 	}
// 	//verifier id user
// 	for (const tournament of tournaments.values()) {
// 		for (const participant of tournament.participants) {
// 			if (participant === userId) {
// 				return reply
// 					.status(400)
// 					.send({ error: 'User is already in another tournament' })
// 			}
// 		}
// 	}
// 	const tournament = tournaments.get(Number(tournamentId.id))
// 	if (!tournament) {
// 		return reply.status(404).send({ error: 'Tournament not found' })
// 	}
// 	if (tournament.participantsBan.includes(userId) == true) {
// 		return reply.status(403).send({ error: 'User is ban from this tournament' })
// 	}
// 	if (tournament.participants.length >= tournament.maxParticipants) {
// 		return reply.status(400).send({ error: 'Tournament is full' })
// 	}
// 	if (tournament.participants.includes(userId)) {
// 		return reply
// 			.status(400)
// 			.send({ error: 'User already joined the tournament' })
// 	}
// 	tournament.participants.push(userId)
// 	return reply.send({ success: true, tournament })
// }

// async function registerRoutes(app: FastifyInstance) {
// 	await app.register(tournamentRoutes)
// 	await app.register(historyRoutes)
// }

// function getDb(): Database {
// 	if (!db) {
// 		const path = process.env.MATCHMAKING_DB_PATH
// 		if (!path) {
// 			throw new Error(
// 				'MATCHMAKING_DB_PATH environment variable is required to connect to the database'
// 			)
// 		}
// 		// Ensure directory exists
// 		mkdirSync(dirname(path), { recursive: true })
// 		db = new BetterSqlite3(path)
// 	}
// 	return db
// }

// function saveMatchToHistory(
// 	player1Id: number,
// 	player2Id: number,
// 	scorePlayer1: number,
// 	scorePlayer2: number,
// 	isTournament: boolean = false
// ): number {
// 	const db = getDb()
// 	const winnerId = scorePlayer1 > scorePlayer2 ? player1Id : player2Id

// 	const matchResult = db
// 		.prepare(
// 			`
// 		INSERT INTO match_history (winner_id, is_tournament)
// 		VALUES (?, ?)
// 	`
// 		)
// 		.run(winnerId, isTournament)

// 	const matchId = matchResult.lastInsertRowid as number

// 	db.prepare(
// 		`
// 		INSERT INTO match_player (id_match, player_id, score)
// 		VALUES (?, ?, ?)
// 	`
// 	).run(matchId, player1Id, scorePlayer1)

// 	db.prepare(
// 		`
// 		INSERT INTO match_player (id_match, player_id, score)
// 		VALUES (?, ?, ?)
// 	`
// 	).run(matchId, player2Id, scorePlayer2)

// 	return matchId
// }

// function runMigrations() {
// 	const db = getDb()
// 	db.exec(`
// 		CREATE TABLE IF NOT EXISTS match_history (
// 			id_match INTEGER PRIMARY KEY AUTOINCREMENT,
// 			winner_id INTEGER NOT NULL,
// 			played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
// 			round INTEGER DEFAULT NULL,
// 			id_tournament INTEGER DEFAULT NULL
// 		);
		
// 		CREATE TABLE IF NOT EXISTS match_player (
// 			id_match INTEGER NOT NULL,
// 			player_id INTEGER NOT NULL,
// 			score INTEGER DEFAULT 0,
// 			PRIMARY KEY (id_match, player_id),
// 			FOREIGN KEY (id_match) REFERENCES match_history(id_match) ON DELETE CASCADE
// 		);
// 	`)
// }

// async function runServer() {
// 	console.log('Starting Matchmaking service...')
// 	runMigrations()
// 	console.log('Database migrations completed')
// 	const openapiFilePath = process.env.DTO_OPENAPI_FILE
// 	if (!openapiFilePath) {
// 		throw new Error('DTO_OPENAPI_FILE is not defined in environment variables')
// 	}
// 	await app.register(metricPlugin.default, { endpoint: '/metrics' })
// 	const openapiSwagger = JSON.parse(fs.readFileSync(openapiFilePath, 'utf-8'))
// 	await app.register(Swagger, {
// 		openapi: {
// 			info: {
// 				title: 'API for Matchmaking Service',
// 				version: '1.0.0'
// 			},
// 			servers: [
// 				{ url: 'http:localhost:8080/matchmaking', description: 'Local server' }
// 			],
// 			components: openapiSwagger.components
// 		},
// 		transform: jsonSchemaTransform
// 	})
// 	await app.register(SwaggerUI, {
// 		routePrefix: '/docs'
// 	})

// 	await registerRoutes(app)

// 	const port = Number(process.env.PORT)
// 	const host = '0.0.0.0'

// 	await app.listen({ port, host })
// 	console.log(` Matchmaking service running on ${host}:${port}`)
// }

// runServer().catch((error) => {
// 	console.error('Failed to start Matchmaking service:', error)
// 	process.exit(1)
// })
