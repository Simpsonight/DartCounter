import type { Dart } from '~/types/score'
import type { GameSettings } from '~/types/game'

/**
 * Composable for calculating provisional/display scores during a turn.
 *
 * This handles the complex logic of:
 * - Calculating running score as darts are thrown
 * - Double-in rule: only counting score after first double is hit
 * - Ensuring score never goes below 0
 */
export const useDisplayScore = () => {
  /**
   * Calculate the provisional score based on current darts thrown.
   *
   * @param remainingScore - Player's current remaining score before this turn
   * @param currentDarts - Darts thrown in the current turn
   * @param gameSettings - Game settings (for double-in rule)
   * @param hasStarted - Whether the player has already started (hit first double in double-in mode)
   * @returns The provisional remaining score
   */
  const calculateProvisionalScore = (
    remainingScore: number,
    currentDarts: Dart[],
    gameSettings: GameSettings,
    hasStarted: boolean
  ): number => {
    // If no darts thrown, return the actual remaining score
    if (currentDarts.length === 0) {
      return remainingScore
    }

    // Check double-in rule: if player hasn't started, only count darts after first double
    if (gameSettings.doubleIn && !hasStarted) {
      const hasDouble = currentDarts.some(
        (dart) => dart.multiplier === 2 && dart.totalValue > 0
      )

      if (!hasDouble) {
        // No double hit yet - no score reduction
        return remainingScore
      }

      // Player hit a double - count darts from first double onwards
      const firstDoubleIndex = currentDarts.findIndex(
        (dart) => dart.multiplier === 2 && dart.totalValue > 0
      )
      const dartsAfterDouble = currentDarts.slice(firstDoubleIndex)
      const turnTotal = dartsAfterDouble.reduce(
        (sum, dart) => sum + dart.totalValue,
        0
      )
      return Math.max(0, remainingScore - turnTotal)
    }

    // Normal calculation (player has already started or no double-in rule)
    const turnTotal = currentDarts.reduce(
      (sum, dart) => sum + dart.totalValue,
      0
    )
    return Math.max(0, remainingScore - turnTotal)
  }

  /**
   * Calculate the current turn total.
   *
   * @param currentDarts - Darts thrown in the current turn
   * @param gameSettings - Game settings (for double-in rule)
   * @param hasStarted - Whether the player has already started
   * @returns The total score for this turn (accounting for double-in rule)
   */
  const calculateTurnTotal = (
    currentDarts: Dart[],
    gameSettings: GameSettings,
    hasStarted: boolean
  ): number => {
    if (currentDarts.length === 0) {
      return 0
    }

    // Check double-in rule
    if (gameSettings.doubleIn && !hasStarted) {
      const firstDoubleIndex = currentDarts.findIndex(
        (dart) => dart.multiplier === 2 && dart.totalValue > 0
      )

      if (firstDoubleIndex === -1) {
        // No double hit yet - turn total is 0
        return 0
      }

      // Count darts from first double onwards
      const dartsAfterDouble = currentDarts.slice(firstDoubleIndex)
      return dartsAfterDouble.reduce((sum, dart) => sum + dart.totalValue, 0)
    }

    // Normal calculation
    return currentDarts.reduce((sum, dart) => sum + dart.totalValue, 0)
  }

  return {
    calculateProvisionalScore,
    calculateTurnTotal,
  }
}
