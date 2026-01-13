import type { GameMode } from '~/types/game'

// Game modes
export const GAME_MODES: Record<GameMode, number> = {
  '301': 301,
  '501': 501,
  '701': 701
}

// Valid dart scores (0-20 per dart, plus bull 25)
export const VALID_SINGLE_SCORES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25
]

// Maximum possible score in a single turn (3 darts)
export const MAX_TURN_SCORE = 180 // T20 + T20 + T20

// Maximum possible score per dart
export const MAX_DART_SCORE = 60 // T20

// Checkout range
export const MIN_CHECKOUT = 2
export const MAX_CHECKOUT = 170 // T20 + T20 + Bull

// Player limits
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 4

// Darts per turn
export const DARTS_PER_TURN = 3

// Score segments
export const SEGMENTS = {
  SINGLE: 1,
  DOUBLE: 2,
  TRIPLE: 3
} as const

// Bull scores
export const BULL_SINGLE = 25
export const BULL_DOUBLE = 50

// Special scores that can't be finished on
export const IMPOSSIBLE_CHECKOUTS = [169, 168, 166, 165, 163, 162, 159]

// Minimum score that requires a double to finish
export const MIN_DOUBLE_OUT = 2
