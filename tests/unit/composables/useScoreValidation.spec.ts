import { describe, it, expect } from 'vitest'
import { useScoreValidation } from '~/composables/useScoreValidation'
import type { Dart } from '~/types/score'
import type { GameSettings } from '~/types/game'

describe('useScoreValidation', () => {
  const {
    isValidDartScore,
    calculateDartValue,
    getDartSegment,
    isBust,
    isValidCheckout,
    canStart,
    validateScoreEntry,
    getMaxPossibleRemaining,
    isImpossibleCheckout
  } = useScoreValidation()

  // Helper to create dart objects
  const createDart = (score: number, multiplier: 1 | 2 | 3): Dart => ({
    score,
    multiplier,
    totalValue: score === 25 && multiplier === 2 ? 50 : score * multiplier,
    segment: getDartSegment(score, multiplier)
  })

  describe('isValidDartScore', () => {
    it('should accept valid single scores (1-20)', () => {
      for (let i = 1; i <= 20; i++) {
        expect(isValidDartScore(i, 1)).toBe(true)
      }
    })

    it('should accept valid double scores (D1-D20)', () => {
      for (let i = 1; i <= 20; i++) {
        expect(isValidDartScore(i, 2)).toBe(true)
      }
    })

    it('should accept valid triple scores (T1-T20)', () => {
      for (let i = 1; i <= 20; i++) {
        expect(isValidDartScore(i, 3)).toBe(true)
      }
    })

    it('should accept single bull (25)', () => {
      expect(isValidDartScore(25, 1)).toBe(true)
    })

    it('should accept double bull (50)', () => {
      expect(isValidDartScore(25, 2)).toBe(true)
    })

    it('should accept miss (0)', () => {
      expect(isValidDartScore(0, 1)).toBe(true)
    })

    it('should reject invalid scores', () => {
      expect(isValidDartScore(21, 1)).toBe(false)
      expect(isValidDartScore(-1, 1)).toBe(false)
      expect(isValidDartScore(25, 3)).toBe(false) // No triple bull
    })
  })

  describe('calculateDartValue', () => {
    it('should calculate single scores correctly', () => {
      expect(calculateDartValue(20, 1)).toBe(20)
      expect(calculateDartValue(1, 1)).toBe(1)
    })

    it('should calculate double scores correctly', () => {
      expect(calculateDartValue(20, 2)).toBe(40)
      expect(calculateDartValue(16, 2)).toBe(32)
    })

    it('should calculate triple scores correctly', () => {
      expect(calculateDartValue(20, 3)).toBe(60)
      expect(calculateDartValue(19, 3)).toBe(57)
    })

    it('should calculate bull correctly', () => {
      expect(calculateDartValue(25, 1)).toBe(25)
      expect(calculateDartValue(25, 2)).toBe(50)
    })
  })

  describe('getDartSegment', () => {
    it('should format single scores', () => {
      expect(getDartSegment(20, 1)).toBe('20')
      expect(getDartSegment(1, 1)).toBe('1')
    })

    it('should format double scores', () => {
      expect(getDartSegment(20, 2)).toBe('D20')
      expect(getDartSegment(16, 2)).toBe('D16')
    })

    it('should format triple scores', () => {
      expect(getDartSegment(20, 3)).toBe('T20')
      expect(getDartSegment(19, 3)).toBe('T19')
    })

    it('should format bull correctly', () => {
      expect(getDartSegment(25, 1)).toBe('25')
      expect(getDartSegment(25, 2)).toBe('Bull')
    })

    it('should format miss', () => {
      expect(getDartSegment(0, 1)).toBe('Miss')
    })
  })

  describe('isBust', () => {
    const doubleOutSettings: GameSettings = { doubleIn: false, doubleOut: true }
    const noDoubleOutSettings: GameSettings = { doubleIn: false, doubleOut: false }

    it('should detect bust when score goes below 0', () => {
      const darts = [createDart(20, 3)] // 60 points
      expect(isBust(darts, 50, doubleOutSettings)).toBe(true)
    })

    it('should detect bust when score is exactly 1 with double out', () => {
      const darts = [createDart(19, 1)] // 19 points
      expect(isBust(darts, 20, doubleOutSettings)).toBe(true)
    })

    it('should not bust when score is exactly 1 without double out', () => {
      const darts = [createDart(19, 1)]
      expect(isBust(darts, 20, noDoubleOutSettings)).toBe(false)
    })

    it('should detect bust when finishing without double (double out required)', () => {
      const darts = [createDart(20, 1)] // Single 20
      expect(isBust(darts, 20, doubleOutSettings)).toBe(true)
    })

    it('should not bust when finishing on double', () => {
      const darts = [createDart(20, 2)] // D20 = 40
      expect(isBust(darts, 40, doubleOutSettings)).toBe(false)
    })

    it('should not bust on valid score reduction', () => {
      const darts = [createDart(20, 3)] // T20 = 60
      expect(isBust(darts, 501, doubleOutSettings)).toBe(false)
    })
  })

  describe('isValidCheckout', () => {
    const doubleOutSettings: GameSettings = { doubleIn: false, doubleOut: true }
    const noDoubleOutSettings: GameSettings = { doubleIn: false, doubleOut: false }

    it('should validate checkout on double with double out rule', () => {
      const darts = [createDart(20, 2)] // D20 = 40
      expect(isValidCheckout(darts, 40, doubleOutSettings)).toBe(true)
    })

    it('should reject checkout not on double with double out rule', () => {
      const darts = [createDart(20, 1), createDart(20, 1)] // 40 total
      expect(isValidCheckout(darts, 40, doubleOutSettings)).toBe(false)
    })

    it('should allow checkout on any dart without double out rule', () => {
      const darts = [createDart(20, 1), createDart(20, 1)] // 40 total
      expect(isValidCheckout(darts, 40, noDoubleOutSettings)).toBe(true)
    })

    it('should validate bull checkout', () => {
      const darts = [createDart(25, 2)] // Bull = 50
      expect(isValidCheckout(darts, 50, doubleOutSettings)).toBe(true)
    })

    it('should reject non-zero remaining', () => {
      const darts = [createDart(20, 2)] // D20 = 40
      expect(isValidCheckout(darts, 50, doubleOutSettings)).toBe(false)
    })
  })

  describe('canStart', () => {
    const doubleInSettings: GameSettings = { doubleIn: true, doubleOut: true }
    const noDoubleInSettings: GameSettings = { doubleIn: false, doubleOut: true }

    it('should allow any dart if already started', () => {
      const dart = createDart(20, 1)
      expect(canStart(dart, doubleInSettings, true)).toBe(true)
    })

    it('should allow any dart without double in rule', () => {
      const dart = createDart(20, 1)
      expect(canStart(dart, noDoubleInSettings, false)).toBe(true)
    })

    it('should require double to start with double in rule', () => {
      const singleDart = createDart(20, 1)
      const doubleDart = createDart(20, 2)
      expect(canStart(singleDart, doubleInSettings, false)).toBe(false)
      expect(canStart(doubleDart, doubleInSettings, false)).toBe(true)
    })

    it('should reject miss as starting dart with double in', () => {
      const missDart = createDart(0, 1)
      expect(canStart(missDart, doubleInSettings, false)).toBe(false)
    })
  })

  describe('validateScoreEntry', () => {
    const settings: GameSettings = { doubleIn: false, doubleOut: true }

    it('should reject empty darts array', () => {
      const result = validateScoreEntry([], 501, settings)
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('No darts entered')
    })

    it('should reject more than 3 darts', () => {
      const darts = [
        createDart(20, 1),
        createDart(20, 1),
        createDart(20, 1),
        createDart(20, 1)
      ]
      const result = validateScoreEntry(darts, 501, settings)
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('Maximum 3 darts per turn')
    })

    it('should calculate valid score entry', () => {
      const darts = [createDart(20, 3), createDart(20, 3), createDart(20, 3)] // 180
      const result = validateScoreEntry(darts, 501, settings)
      expect(result.isValid).toBe(true)
      expect(result.totalScore).toBe(180)
      expect(result.isBust).toBe(false)
      expect(result.isCheckout).toBe(false)
    })

    it('should detect bust', () => {
      const darts = [createDart(20, 3)] // 60
      const result = validateScoreEntry(darts, 50, settings)
      expect(result.isValid).toBe(true)
      expect(result.isBust).toBe(true)
    })

    it('should detect valid checkout', () => {
      const darts = [createDart(20, 1), createDart(20, 2)] // 20 + D20 = 60
      const result = validateScoreEntry(darts, 60, settings)
      expect(result.isValid).toBe(true)
      expect(result.isCheckout).toBe(true)
      expect(result.isBust).toBe(false)
    })

    it('should handle double in rule - no double hit', () => {
      const doubleInSettings: GameSettings = { doubleIn: true, doubleOut: true }
      const darts = [createDart(20, 1), createDart(20, 1), createDart(20, 1)]
      const result = validateScoreEntry(darts, 501, doubleInSettings, false)
      expect(result.isValid).toBe(true)
      expect(result.isBust).toBe(true)
      expect(result.totalScore).toBe(0)
    })

    it('should handle double in rule - double hit', () => {
      const doubleInSettings: GameSettings = { doubleIn: true, doubleOut: true }
      const darts = [createDart(20, 1), createDart(20, 2), createDart(20, 1)] // S20, D20, S20
      const result = validateScoreEntry(darts, 501, doubleInSettings, false)
      expect(result.isValid).toBe(true)
      expect(result.isBust).toBe(false)
      // Should count from double onwards: D20 + S20 = 60
      expect(result.totalScore).toBe(60)
    })
  })

  describe('getMaxPossibleRemaining', () => {
    it('should calculate max remaining with 0 darts thrown', () => {
      expect(getMaxPossibleRemaining(501, 0)).toBe(501 - 180)
    })

    it('should calculate max remaining with 1 dart thrown', () => {
      expect(getMaxPossibleRemaining(441, 1)).toBe(441 - 120)
    })

    it('should calculate max remaining with 2 darts thrown', () => {
      expect(getMaxPossibleRemaining(381, 2)).toBe(381 - 60)
    })

    it('should not go below 0', () => {
      expect(getMaxPossibleRemaining(50, 0)).toBe(0)
    })
  })

  describe('isImpossibleCheckout', () => {
    it('should identify impossible checkouts', () => {
      expect(isImpossibleCheckout(169)).toBe(true)
      expect(isImpossibleCheckout(168)).toBe(true)
      expect(isImpossibleCheckout(166)).toBe(true)
      expect(isImpossibleCheckout(165)).toBe(true)
      expect(isImpossibleCheckout(163)).toBe(true)
      expect(isImpossibleCheckout(162)).toBe(true)
      expect(isImpossibleCheckout(159)).toBe(true)
    })

    it('should identify possible checkouts', () => {
      expect(isImpossibleCheckout(170)).toBe(false)
      expect(isImpossibleCheckout(167)).toBe(false)
      expect(isImpossibleCheckout(164)).toBe(false)
      expect(isImpossibleCheckout(100)).toBe(false)
      expect(isImpossibleCheckout(50)).toBe(false)
    })
  })
})
