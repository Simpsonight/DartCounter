import type { Turn } from './score'
import type { BotDifficulty } from './bot'

export type GameMode = '301' | '501' | '701'

export type GameStatus = 'setup' | 'active' | 'paused' | 'completed'

export interface Game {
  id: string
  mode: GameMode
  status: GameStatus
  players: GamePlayer[]
  currentPlayerIndex: number
  turns: Turn[]
  settings: GameSettings
  startedAt: Date
  completedAt?: Date
  winnerId?: string
  // Sets & Legs tracking
  currentSet: number        // 1-based index (Set 1, Set 2, etc.)
  currentLeg: number        // 1-based index (Leg 1, Leg 2, etc.)
  setsWon: Record<string, number>  // playerId -> sets won count
  legsWon: Record<string, number>  // playerId -> legs won in current set
}

export interface GamePlayer {
  playerId: string
  playerName: string
  playerAvatar?: string
  remainingScore: number
  turnCount: number
  dartCount: number
  averageScore: number
  checkoutAttempts: number
  successfulCheckouts: number
  hasStarted: boolean  // For double-in rule: true after first double hit
  // Bot player fields
  isBot?: boolean
  botDifficulty?: BotDifficulty
}

export interface GameSettings {
  doubleIn: boolean
  doubleOut: boolean
  sets?: number
  legs?: number
}
