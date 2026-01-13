import type { GameMode } from './game'

export interface Player {
  id: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  stats: PlayerStats
  supabaseId?: string
}

export interface PlayerStats {
  gamesPlayed: number
  gamesWon: number
  totalDarts: number
  totalScore: number
  averageScore: number
  highestCheckout: number
  checkoutPercentage: number
  favoriteGameMode?: GameMode
}

export interface PlayerFormData {
  name: string
  avatar?: string
}
