import type { Dart, ScoreEntry } from '~/types/score'
import type { GameSettings } from '~/types/game'
import {
  VALID_SINGLE_SCORES,
  MAX_DART_SCORE,
  SEGMENTS,
  BULL_SINGLE,
  BULL_DOUBLE,
  DARTS_PER_TURN
} from '~/utils/constants'

export const useScoreValidation = () => {
  /**
   * Validate a single dart score
   */
  const isValidDartScore = (score: number, multiplier: 1 | 2 | 3): boolean => {
    // Bull double
    if (score === BULL_SINGLE && multiplier === SEGMENTS.DOUBLE) {
      return true
    }

    // Bull single (can't be trebled)
    if (score === BULL_SINGLE && multiplier === SEGMENTS.SINGLE) {
      return true
    }

    // Standard scores 0-20
    if (VALID_SINGLE_SCORES.includes(score) && score !== BULL_SINGLE) {
      const totalValue = score * multiplier
      return totalValue >= 0 && totalValue <= MAX_DART_SCORE
    }

    return false
  }

  /**
   * Calculate total value for a dart
   */
  const calculateDartValue = (score: number, multiplier: 1 | 2 | 3): number => {
    if (score === BULL_SINGLE && multiplier === SEGMENTS.DOUBLE) {
      return BULL_DOUBLE
    }
    if (score === BULL_SINGLE) {
      return BULL_SINGLE
    }
    return score * multiplier
  }

  /**
   * Create dart segment string (e.g., "T20", "D16", "Bull")
   */
  const getDartSegment = (score: number, multiplier: 1 | 2 | 3): string => {
    if (score === BULL_SINGLE && multiplier === SEGMENTS.DOUBLE) {
      return 'Bull'
    }
    if (score === BULL_SINGLE) {
      return 'S-Bull'
    }
    if (score === 0) {
      return 'Miss'
    }

    const prefix = multiplier === SEGMENTS.TRIPLE ? 'T' : multiplier === SEGMENTS.DOUBLE ? 'D' : ''
    return `${prefix}${score}`
  }

  /**
   * Check if a score causes a bust
   * Bust conditions:
   * - Score goes below 0
   * - Score goes to exactly 1 (impossible to finish)
   * - Finish without double (if doubleOut is enabled)
   */
  const isBust = (
    darts: Dart[],
    remainingBefore: number,
    settings: GameSettings
  ): boolean => {
    const totalScore = darts.reduce((sum, dart) => sum + dart.totalValue, 0)
    const remainingAfter = remainingBefore - totalScore

    // Score went below 0
    if (remainingAfter < 0) {
      return true
    }

    // Score is exactly 1 (impossible to finish)
    if (remainingAfter === 1) {
      return true
    }

    // Reached 0 but need to check double out rule
    if (remainingAfter === 0 && settings.doubleOut) {
      const lastDart = darts[darts.length - 1]
      // Must finish on a double
      if (lastDart.multiplier !== SEGMENTS.DOUBLE) {
        return true
      }
    }

    return false
  }

  /**
   * Check if a turn is a valid checkout
   */
  const isValidCheckout = (
    darts: Dart[],
    remainingBefore: number,
    settings: GameSettings
  ): boolean => {
    const totalScore = darts.reduce((sum, dart) => sum + dart.totalValue, 0)
    const remainingAfter = remainingBefore - totalScore

    // Must reach exactly 0
    if (remainingAfter !== 0) {
      return false
    }

    // If doubleOut is required, last dart must be a double
    if (settings.doubleOut) {
      const lastDart = darts[darts.length - 1]
      return lastDart.multiplier === SEGMENTS.DOUBLE
    }

    return true
  }

  /**
   * Check if a player can start (double in rule)
   */
  const canStart = (
    firstDart: Dart,
    settings: GameSettings,
    hasStarted: boolean
  ): boolean => {
    // If player has already started, they can throw anything
    if (hasStarted) {
      return true
    }

    // If doubleIn is not required, player can start with any score
    if (!settings.doubleIn) {
      return true
    }

    // Must hit a double to start
    return firstDart.multiplier === SEGMENTS.DOUBLE && firstDart.totalValue > 0
  }

  /**
   * Validate a complete score entry (up to 3 darts)
   */
  const validateScoreEntry = (
    darts: Dart[],
    remainingScore: number,
    settings: GameSettings
  ): ScoreEntry => {
    // Validate number of darts
    if (darts.length === 0) {
      return {
        darts: [],
        totalScore: 0,
        isValid: false,
        isBust: false,
        isCheckout: false,
        errorMessage: 'No darts entered'
      }
    }

    if (darts.length > DARTS_PER_TURN) {
      return {
        darts,
        totalScore: 0,
        isValid: false,
        isBust: false,
        isCheckout: false,
        errorMessage: `Maximum ${DARTS_PER_TURN} darts per turn`
      }
    }

    // Validate each dart
    for (const dart of darts) {
      if (!isValidDartScore(dart.score, dart.multiplier)) {
        return {
          darts,
          totalScore: 0,
          isValid: false,
          isBust: false,
          isCheckout: false,
          errorMessage: `Invalid dart: ${getDartSegment(dart.score, dart.multiplier)}`
        }
      }
    }

    // Calculate total
    const totalScore = darts.reduce((sum, dart) => sum + dart.totalValue, 0)

    // Check for bust
    const bustCheck = isBust(darts, remainingScore, settings)
    if (bustCheck) {
      return {
        darts,
        totalScore,
        isValid: true,
        isBust: true,
        isCheckout: false,
        errorMessage: 'Bust! Score remains unchanged'
      }
    }

    // Check for checkout
    const checkoutCheck = isValidCheckout(darts, remainingScore, settings)

    return {
      darts,
      totalScore,
      isValid: true,
      isBust: false,
      isCheckout: checkoutCheck
    }
  }

  /**
   * Get maximum possible remaining score after a dart throw
   */
  const getMaxPossibleRemaining = (remaining: number, dartsThrownCount: number): number => {
    const dartsLeft = DARTS_PER_TURN - dartsThrownCount
    return Math.max(0, remaining - (MAX_DART_SCORE * dartsLeft))
  }

  return {
    isValidDartScore,
    calculateDartValue,
    getDartSegment,
    isBust,
    isValidCheckout,
    canStart,
    validateScoreEntry,
    getMaxPossibleRemaining
  }
}
