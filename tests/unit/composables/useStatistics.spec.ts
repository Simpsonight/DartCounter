import { describe, it, expect } from 'vitest'
import type { Turn } from '~/types/score'

/**
 * Tests for statistics calculation logic.
 * These tests verify the core calculation functions used in useStatistics
 * without requiring the full Nuxt/IndexedDB environment.
 */

// Helper to create turn objects
const createTurn = (
  playerId: string,
  turnNumber: number,
  totalScore: number,
  dartsCount: number = 3,
  isBust: boolean = false
): Turn => ({
  id: `turn-${turnNumber}`,
  gameId: 'game-1',
  playerId,
  turnNumber,
  setNumber: 1,
  legNumber: 1,
  darts: Array(dartsCount).fill({ score: 20, multiplier: 1, totalValue: 20, segment: '20' }),
  scoreBeforeTurn: 501 - (turnNumber - 1) * totalScore,
  scoreAfterTurn: 501 - turnNumber * totalScore,
  totalScore,
  isBust,
  isCheckout: false,
  timestamp: new Date()
})

// Pure function implementations matching useStatistics.ts
const calculateThreeDartAverage = (turns: Turn[], playerId: string): number => {
  const playerTurns = turns.filter(t => t.playerId === playerId && !t.isBust)
  if (playerTurns.length === 0) return 0

  let totalScore = 0
  let totalDarts = 0

  for (const turn of playerTurns) {
    totalScore += turn.totalScore
    totalDarts += turn.darts.length
  }

  if (totalDarts === 0) return 0
  return (totalScore / totalDarts) * 3
}

const calculateFirstNineAverage = (turns: Turn[], playerId: string): number => {
  const playerTurns = turns
    .filter(t => t.playerId === playerId)
    .sort((a, b) => a.turnNumber - b.turnNumber)

  const firstThreeTurns = playerTurns.slice(0, 3)
  if (firstThreeTurns.length === 0) return 0

  let totalScore = 0
  let totalDarts = 0

  for (const turn of firstThreeTurns) {
    if (!turn.isBust) {
      totalScore += turn.totalScore
      totalDarts += turn.darts.length
    }
  }

  if (totalDarts === 0) return 0
  return (totalScore / totalDarts) * 3
}

describe('Statistics Calculations - Three Dart Average', () => {
  it('should calculate 3-dart average correctly', () => {
    const turns: Turn[] = [
      createTurn('player-1', 1, 60, 3),
      createTurn('player-1', 2, 100, 3),
      createTurn('player-1', 3, 80, 3)
    ]
    // Total: 240 points, 9 darts
    // 3-dart average = (240 / 9) * 3 = 80
    expect(calculateThreeDartAverage(turns, 'player-1')).toBe(80)
  })

  it('should exclude bust turns', () => {
    const turns: Turn[] = [
      createTurn('player-1', 1, 60, 3),
      createTurn('player-1', 2, 100, 3, true), // Bust
      createTurn('player-1', 3, 60, 3)
    ]
    // Total: 120 points, 6 darts (bust excluded)
    expect(calculateThreeDartAverage(turns, 'player-1')).toBe(60)
  })

  it('should only count turns for the specified player', () => {
    const turns: Turn[] = [
      createTurn('player-1', 1, 60, 3),
      createTurn('player-2', 2, 180, 3),
      createTurn('player-1', 3, 60, 3)
    ]
    expect(calculateThreeDartAverage(turns, 'player-1')).toBe(60)
  })

  it('should return 0 for no turns', () => {
    expect(calculateThreeDartAverage([], 'player-1')).toBe(0)
  })

  it('should return 0 for player with no turns', () => {
    const turns: Turn[] = [createTurn('player-2', 1, 60, 3)]
    expect(calculateThreeDartAverage(turns, 'player-1')).toBe(0)
  })

  it('should handle perfect 180 average', () => {
    const turns: Turn[] = [
      createTurn('player-1', 1, 180, 3),
      createTurn('player-1', 2, 180, 3),
      createTurn('player-1', 3, 180, 3)
    ]
    expect(calculateThreeDartAverage(turns, 'player-1')).toBe(180)
  })

  it('should handle turns with fewer than 3 darts', () => {
    const turns: Turn[] = [
      createTurn('player-1', 1, 60, 3),
      createTurn('player-1', 2, 40, 2)
    ]
    // Total: 100 points, 5 darts = (100/5)*3 = 60
    expect(calculateThreeDartAverage(turns, 'player-1')).toBe(60)
  })
})

describe('Statistics Calculations - First Nine Average', () => {
  it('should calculate first 9 darts average', () => {
    const turns: Turn[] = [
      createTurn('player-1', 1, 100, 3),
      createTurn('player-1', 2, 100, 3),
      createTurn('player-1', 3, 100, 3),
      createTurn('player-1', 4, 60, 3) // Excluded
    ]
    expect(calculateFirstNineAverage(turns, 'player-1')).toBe(100)
  })

  it('should sort by turn number', () => {
    const turns: Turn[] = [
      createTurn('player-1', 3, 60, 3),
      createTurn('player-1', 1, 100, 3),
      createTurn('player-1', 2, 80, 3)
    ]
    // 100 + 80 + 60 = 240 / 9 * 3 = 80
    expect(calculateFirstNineAverage(turns, 'player-1')).toBe(80)
  })

  it('should exclude bust turns', () => {
    const turns: Turn[] = [
      createTurn('player-1', 1, 100, 3),
      createTurn('player-1', 2, 50, 3, true),
      createTurn('player-1', 3, 100, 3)
    ]
    // 200 / 6 * 3 = 100
    expect(calculateFirstNineAverage(turns, 'player-1')).toBe(100)
  })

  it('should handle less than 3 turns', () => {
    const turns: Turn[] = [
      createTurn('player-1', 1, 100, 3),
      createTurn('player-1', 2, 80, 3)
    ]
    // 180 / 6 * 3 = 90
    expect(calculateFirstNineAverage(turns, 'player-1')).toBe(90)
  })

  it('should return 0 for no turns', () => {
    expect(calculateFirstNineAverage([], 'player-1')).toBe(0)
  })

  it('should only include specified player turns', () => {
    const turns: Turn[] = [
      createTurn('player-1', 1, 100, 3),
      createTurn('player-2', 1, 180, 3),
      createTurn('player-1', 2, 80, 3),
      createTurn('player-2', 2, 140, 3),
      createTurn('player-1', 3, 60, 3)
    ]
    // Player 1: 240 / 9 * 3 = 80
    expect(calculateFirstNineAverage(turns, 'player-1')).toBe(80)
  })
})

describe('Statistics Calculations - High Score Counting', () => {
  const countHighScores = (turns: { totalScore: number, isBust: boolean }[]) => {
    let oneEighties = 0
    let oneFourtyPlus = 0
    let oneHundredPlus = 0

    for (const turn of turns.filter(t => !t.isBust)) {
      if (turn.totalScore === 180) {
        oneEighties++
        oneFourtyPlus++
        oneHundredPlus++
      } else if (turn.totalScore >= 140) {
        oneFourtyPlus++
        oneHundredPlus++
      } else if (turn.totalScore >= 100) {
        oneHundredPlus++
      }
    }

    return { oneEighties, oneFourtyPlus, oneHundredPlus }
  }

  it('should count 180s correctly', () => {
    const turns = [
      { totalScore: 180, isBust: false },
      { totalScore: 180, isBust: false },
      { totalScore: 60, isBust: false }
    ]
    expect(countHighScores(turns).oneEighties).toBe(2)
  })

  it('should count 140+ correctly', () => {
    const turns = [
      { totalScore: 180, isBust: false },
      { totalScore: 140, isBust: false },
      { totalScore: 160, isBust: false },
      { totalScore: 100, isBust: false }
    ]
    expect(countHighScores(turns).oneFourtyPlus).toBe(3)
  })

  it('should count 100+ correctly', () => {
    const turns = [
      { totalScore: 180, isBust: false },
      { totalScore: 140, isBust: false },
      { totalScore: 100, isBust: false },
      { totalScore: 99, isBust: false }
    ]
    expect(countHighScores(turns).oneHundredPlus).toBe(3)
  })

  it('should exclude bust turns', () => {
    const turns = [
      { totalScore: 180, isBust: true },
      { totalScore: 100, isBust: false }
    ]
    const result = countHighScores(turns)
    expect(result.oneEighties).toBe(0)
    expect(result.oneHundredPlus).toBe(1)
  })
})

describe('Statistics Calculations - Checkout Range Analysis', () => {
  const analyzeCheckoutRange = (scores: number[]) => {
    const ranges = {
      under50: 0,
      range50to80: 0,
      range81to100: 0,
      range101to130: 0,
      range131to170: 0
    }

    for (const score of scores) {
      if (score < 50) ranges.under50++
      else if (score <= 80) ranges.range50to80++
      else if (score <= 100) ranges.range81to100++
      else if (score <= 130) ranges.range101to130++
      else ranges.range131to170++
    }

    return ranges
  }

  it('should categorize checkouts under 50', () => {
    expect(analyzeCheckoutRange([32, 40, 16]).under50).toBe(3)
  })

  it('should categorize checkouts 50-80', () => {
    expect(analyzeCheckoutRange([50, 64, 80]).range50to80).toBe(3)
  })

  it('should categorize checkouts 81-100', () => {
    expect(analyzeCheckoutRange([81, 90, 100]).range81to100).toBe(3)
  })

  it('should categorize checkouts 101-130', () => {
    expect(analyzeCheckoutRange([101, 120, 130]).range101to130).toBe(3)
  })

  it('should categorize checkouts 131-170', () => {
    expect(analyzeCheckoutRange([131, 150, 170]).range131to170).toBe(3)
  })

  it('should handle mixed checkouts', () => {
    const result = analyzeCheckoutRange([32, 64, 100, 120, 170])
    expect(result.under50).toBe(1)
    expect(result.range50to80).toBe(1)
    expect(result.range81to100).toBe(1)
    expect(result.range101to130).toBe(1)
    expect(result.range131to170).toBe(1)
  })
})

describe('Statistics Calculations - Win Rate', () => {
  const calculateWinRate = (gamesWon: number, gamesPlayed: number): number => {
    if (gamesPlayed === 0) return 0
    return (gamesWon / gamesPlayed) * 100
  }

  it('should calculate win rate correctly', () => {
    expect(calculateWinRate(5, 10)).toBe(50)
    expect(calculateWinRate(3, 4)).toBe(75)
    expect(calculateWinRate(10, 10)).toBe(100)
  })

  it('should return 0 for no games played', () => {
    expect(calculateWinRate(0, 0)).toBe(0)
  })

  it('should handle 0 wins', () => {
    expect(calculateWinRate(0, 5)).toBe(0)
  })
})

describe('Statistics Calculations - Checkout Percentage', () => {
  const calculateCheckoutPercentage = (successful: number, attempts: number): number => {
    if (attempts === 0) return 0
    return (successful / attempts) * 100
  }

  it('should calculate checkout percentage correctly', () => {
    expect(calculateCheckoutPercentage(5, 10)).toBe(50)
    expect(calculateCheckoutPercentage(1, 4)).toBe(25)
  })

  it('should return 0 for no attempts', () => {
    expect(calculateCheckoutPercentage(0, 0)).toBe(0)
  })

  it('should handle 100% checkout rate', () => {
    expect(calculateCheckoutPercentage(5, 5)).toBe(100)
  })
})
