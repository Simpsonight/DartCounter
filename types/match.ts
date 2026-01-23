import type { GameMode } from './game'
import type { Turn } from './score'

export interface Match {
  id: string
  gameMode: GameMode
  players: MatchPlayer[]
  winnerId: string
  turns: Turn[]
  duration: number
  startedAt: Date
  completedAt: Date
  syncedToSupabase: boolean
  // Sets & Legs tracking
  totalSets?: number
  totalLegs?: number
  finalSetScore?: string  // e.g., "2-1" for best of 3
  setsWon?: Record<string, number>
}

export interface MatchPlayer {
  playerId: string
  playerName: string
  playerAvatar?: string
  finalScore: number
  turnCount: number
  dartCount: number
  averageScore: number
  highestTurnScore: number
  checkoutAttempts: number
  successfulCheckouts: number
}

export interface MatchSummary {
  id: string
  gameMode: GameMode
  playerNames: string[]
  winnerName: string
  duration: number
  completedAt: Date
  isTraining: boolean
}

export interface MatchFilter {
  gameMode?: GameMode
  playerId?: string
  startDate?: Date
  endDate?: Date
}
