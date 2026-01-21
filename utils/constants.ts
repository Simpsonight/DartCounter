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
export const MIN_PLAYERS = 1
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

/**
 * Dartboard segment adjacency map
 * Each segment maps to its two neighboring segments (clockwise order on the board)
 * Used for realistic miss simulation in bot dart generation
 *
 * Dartboard layout (clockwise from top):
 * 20 - 1 - 18 - 4 - 13 - 6 - 10 - 15 - 2 - 17 - 3 - 19 - 7 - 16 - 8 - 11 - 14 - 9 - 12 - 5
 */
export const DARTBOARD_ADJACENCY: Record<number, [number, number]> = {
  20: [5, 1],
  1: [20, 18],
  18: [1, 4],
  4: [18, 13],
  13: [4, 6],
  6: [13, 10],
  10: [6, 15],
  15: [10, 2],
  2: [15, 17],
  17: [2, 3],
  3: [17, 19],
  19: [3, 7],
  7: [19, 16],
  16: [7, 8],
  8: [16, 11],
  11: [8, 14],
  14: [11, 9],
  9: [14, 12],
  12: [9, 5],
  5: [12, 20],
  // Bull has no adjacent segments (misses go to random single)
  25: [25, 25]
}
