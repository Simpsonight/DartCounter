import type { CheckoutSuggestion } from '~/types/score'
import { getCheckouts, hasCheckout } from '~/utils/checkout-table'
import { MAX_CHECKOUT, MIN_CHECKOUT } from '~/utils/constants'

export const useCheckoutCalculator = () => {
  /**
   * Get checkout suggestions for a given remaining score
   */
  const getCheckoutSuggestions = (remainingScore: number): CheckoutSuggestion | null => {
    // No checkout possible if score is out of range
    if (remainingScore < MIN_CHECKOUT || remainingScore > MAX_CHECKOUT) {
      return null
    }

    // Check if checkout is possible
    if (!hasCheckout(remainingScore)) {
      return null
    }

    const combinations = getCheckouts(remainingScore)

    if (combinations.length === 0) {
      return null
    }

    return {
      score: remainingScore,
      combinations
    }
  }

  /**
   * Check if a score is in checkout range
   */
  const isInCheckoutRange = (score: number): boolean => {
    return score >= MIN_CHECKOUT && score <= MAX_CHECKOUT && hasCheckout(score)
  }

  /**
   * Get the preferred checkout (usually the easiest one)
   */
  const getPreferredCheckout = (remainingScore: number) => {
    const suggestions = getCheckoutSuggestions(remainingScore)
    if (!suggestions || suggestions.combinations.length === 0) {
      return null
    }

    // Return the first combination (easiest)
    return suggestions.combinations[0]
  }

  /**
   * Get all possible checkout scores in descending order
   */
  const getAllPossibleCheckouts = (): number[] => {
    const checkouts: number[] = []
    for (let score = MAX_CHECKOUT; score >= MIN_CHECKOUT; score--) {
      if (hasCheckout(score)) {
        checkouts.push(score)
      }
    }
    return checkouts
  }

  /**
   * Calculate average darts needed for checkout based on difficulty
   */
  const getAverageDartsForCheckout = (remainingScore: number): number => {
    const preferred = getPreferredCheckout(remainingScore)
    if (!preferred) {
      return 3 // Assume 3 darts if no checkout available
    }

    return preferred.darts.length
  }

  return {
    getCheckoutSuggestions,
    isInCheckoutRange,
    getPreferredCheckout,
    getAllPossibleCheckouts,
    getAverageDartsForCheckout
  }
}
