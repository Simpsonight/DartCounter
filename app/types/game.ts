import type { Turn } from './score'

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
}

export interface GameSettings {
  doubleIn: boolean
  doubleOut: boolean
  sets?: number
  legs?: number
}
