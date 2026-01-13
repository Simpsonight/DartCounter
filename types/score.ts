export interface Turn {
  id: string
  gameId: string
  playerId: string
  turnNumber: number        // Turn number within the current leg (resets each leg)
  setNumber: number         // Which set this turn belongs to (1-based)
  legNumber: number         // Which leg this turn belongs to (1-based)
  darts: Dart[]
  scoreBeforeTurn: number
  scoreAfterTurn: number
  totalScore: number
  isBust: boolean
  isCheckout: boolean
  timestamp: Date
}

export interface Dart {
  score: number // 0-20, 25
  multiplier: 1 | 2 | 3 // Single, Double, Triple
  totalValue: number // score * multiplier
  segment: string // e.g., 'T20', 'D16', 'Bull', '20'
}

export interface ScoreEntry {
  darts: Dart[]
  totalScore: number
  isValid: boolean
  isBust: boolean
  isCheckout: boolean
  errorMessage?: string
}

export interface CheckoutSuggestion {
  score: number
  combinations: CheckoutCombination[]
}

export interface CheckoutCombination {
  darts: string[]
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
}
