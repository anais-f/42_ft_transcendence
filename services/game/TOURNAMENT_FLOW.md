# 🏆 Tournament Management Flow

## Overview

The tournament system uses a single-elimination bracket tree structure with automatic round progression management.

## Architecture

### Data Structure

```typescript
Tournament {
  id: number
  status: 'pending' | 'ongoing' | 'completed'
  maxParticipants: number  // Must be a power of 2 (2, 4, 8, 16, etc.)
  participants: number[]   // Player IDs
  matchs: MatchTournament[]
}

MatchTournament {
  previousMatchId1?: number  // Previous match index (player 1)
  previousMatchId2?: number  // Previous match index (player 2)
  round: number              // Round number (higher = earlier round)(final = 1)
  matchNumber: number        // Match number within the round
  player1Id?: number
  player2Id?: number
  status: 'ongoing' | 'completed' | 'waiting_for_players'
  scorePlayer1?: number
  scorePlayer2?: number
}
```

### Example for a 4-player tournament

```
Round 2 (Semi-finals) - 2 matches
├─ Match 0: Player1 vs Player2 [ongoing]
└─ Match 1: Player3 vs Player4 [ongoing]

Round 1 (Final) - 1 match
└─ Match 0: Winner(R2-M0) vs Winner(R2-M1) [waiting_for_players]
```

## Flow Operation

### 1. Tournament Creation

```typescript
createTournament(request)
  → generates unique code (e.g., "T-ABC12")
  → creates tournament with status='pending'
  → adds creator to participants
```

### 2. Joining Tournament

```typescript
joinTournament(request)
  → verifies user is not already in a tournament
  → adds user to participants
  → if maxParticipants reached → startTournament()
```

### 3. Tournament Start

```typescript
startTournament(tournament)
  1. Changes status to 'ongoing'
  2. Calls createTournamentTree()
     - Shuffles participants
     - Creates all matches for all rounds
     - First round: with player1Id and player2Id defined
     - Following rounds: with previousMatchId1 and previousMatchId2
  3. Starts ONLY the first round matches
     - startNextRound(firstRound) → requestGame() for each match
```

### 4. Match End

```typescript
saveMatch(request)
  → saves match to DB
  → if tournament match:
    → onTournamentMatchEnd()
```

### 5. Tournament Progression (🔑 KEY LOGIC)

```typescript
onTournamentMatchEnd(tournamentCode, round, matchNumber, winnerId, scores)
  1. Finds and marks match as 'completed'
  2. Saves scores

  3. If round === 1 (final):
     → tournament.status = 'completed'
     → cleans up participants
     → TOURNAMENT END ✨

  4. Otherwise, finds next match:
     → searches in round-1 where previousMatchId1 or previousMatchId2 === matchNumber

  5. Places winner in appropriate slot:
     → if previousMatchId1 === matchNumber → nextMatch.player1Id = winnerId
     → if previousMatchId2 === matchNumber → nextMatch.player2Id = winnerId

  6. Checks if both players are ready:
     → if player1Id AND player2Id are defined:
       → nextMatch.status = 'ongoing'
       → requestGame(player1Id, player2Id) 🚀
```

## Detailed Execution Example

### 4-player Tournament (A, B, C, D)

#### Initialization

```
Round 2 (Semi-finals):
├─ Match 0: A vs B [ongoing] ← starts immediately
└─ Match 1: C vs D [ongoing] ← starts immediately

Round 1 (Final):
└─ Match 0: ??? vs ??? [waiting_for_players]
   (previousMatchId1=0, previousMatchId2=1)
```

#### Scenario 1: A beats B (5-3)

```
onTournamentMatchEnd("T-ABC12", 2, 0, A, 5, 3)
  → Match R2-M0 marked completed
  → Finds next match: R1-M0 (because previousMatchId1=0)
  → Places A in R1-M0.player1Id
  → Checks if player2Id exists → NO
  → Does NOT call requestGame() (waiting for other winner)
```

State after:

```
Round 2:
├─ Match 0: A vs B [completed] ✅ Winner: A
└─ Match 1: C vs D [ongoing]

Round 1:
└─ Match 0: A vs ??? [waiting_for_players]
```

#### Scenario 2: C beats D (4-2)

```
onTournamentMatchEnd("T-ABC12", 2, 1, C, 4, 2)
  → Match R2-M1 marked completed
  → Finds next match: R1-M0 (because previousMatchId2=1)
  → Places C in R1-M0.player2Id
  → Checks if player1Id exists → YES (A) ✅
  → Calls requestGame(A, C) 🎮
```

Final state:

```
Round 2:
├─ Match 0: A vs B [completed] Winner: A
└─ Match 1: C vs D [completed] Winner: C

Round 1:
└─ Match 0: A vs C [ongoing] ← FINAL IN PROGRESS!
```

## Key Points

### ✅ Benefits of this Approach

1. **Automatic**: No manual intervention needed to start rounds
2. **Robust**: Handles matches finishing in any order
3. **Scalable**: Works for any tournament size (power of 2)
4. **Traceable**: Each match knows its previous matches via previousMatchId

### ⚠️ Important Points

1. **maxParticipants** must be a power of 2
2. The **matchNumber** must be passed when calling saveMatch
3. **Rounds are numbered in reverse**: highest round = first round
4. Don't forget to clean up `usersInTournaments` at the end

## Possible Improvements

- [ ] Save complete tournament history
- [ ] Real-time tournament bracket visualization page

## Debugging

To track the flow:

```typescript
console.log('Tournament Matches:', tournament.matchs)
console.log('Match completed:', { round, matchNumber, winnerId })
console.log('Next match ready:', { player1Id, player2Id })
```
