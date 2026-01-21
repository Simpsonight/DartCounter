import type { Dart } from '~/types/score'
import type { GameSettings } from '~/types/game'
import type { BotConfig, BotDifficulty } from '~/types/bot'
import { BOT_CONFIGS } from '~/types/bot'
import { DARTBOARD_ADJACENCY, BULL_SINGLE } from '~/utils/constants'
import { hasCheckout, getCheckouts } from '~/utils/checkout-table'

/**
 * Bot Dart Generator Composable
 *
 * Generates realistic dart throws for bot players based on difficulty settings.
 * Uses skill-based hit rates and dartboard adjacency for miss simulation.
 */
export const useBotDartGenerator = () => {
  const { calculateDartValue, getDartSegment, isBust } = useScoreValidation()

  /**
   * Target definition for bot dart throws
   */
  interface DartTarget {
    score: number        // 0-20 or 25 (bull)
    multiplier: 1 | 2 | 3
  }

  /**
   * Parse a checkout dart string (e.g., "T20", "D16", "Bull", "19")
   */
  const parseCheckoutDart = (dartStr: string): DartTarget => {
    if (dartStr === 'Bull') {
      return { score: 25, multiplier: 2 }  // Double bull (50)
    }
    if (dartStr === '25') {
      return { score: 25, multiplier: 1 }  // Single bull (25)
    }

    const match = dartStr.match(/^([TDtd])?(\d+)$/)
    if (!match) {
      return { score: 0, multiplier: 1 }  // Miss
    }

    const [, prefix, scoreStr] = match
    const score = parseInt(scoreStr, 10)
    let multiplier: 1 | 2 | 3 = 1

    if (prefix === 'T' || prefix === 't') {
      multiplier = 3
    } else if (prefix === 'D' || prefix === 'd') {
      multiplier = 2
    }

    return { score, multiplier }
  }

  /**
   * Get hit rate for a specific target based on bot config
   */
  const getHitRate = (target: DartTarget, config: BotConfig): number => {
    if (target.score === 25) {
      return config.bullHitRate
    }
    if (target.multiplier === 3) {
      return config.trebleHitRate
    }
    if (target.multiplier === 2) {
      return config.doubleHitRate
    }
    return config.singleHitRate
  }

  /**
   * Generate a realistic miss based on target and config
   */
  const generateMiss = (target: DartTarget, config: BotConfig): Dart => {
    const missType = Math.random()

    // Bull miss - goes to random single in the outer ring
    if (target.score === 25) {
      const randomSegment = Math.floor(Math.random() * 20) + 1
      return createDart(randomSegment, 1)
    }

    // Easy bot has much higher chance of complete miss or random segment
    if (config.missVariance >= 3) {
      // 25% complete miss (0 points)
      if (missType < 0.25) {
        return createDart(0, 1)
      }
      // 35% random low segment (1-10)
      if (missType < 0.60) {
        const lowSegment = Math.floor(Math.random() * 10) + 1
        return createDart(lowSegment, 1)
      }
      // 25% adjacent segment
      if (missType < 0.85) {
        const adjacency = DARTBOARD_ADJACENCY[target.score]
        if (adjacency) {
          const adjacentScore = adjacency[Math.floor(Math.random() * 2)]
          return createDart(adjacentScore, 1)
        }
      }
      // 15% single of target
      return createDart(target.score, 1)
    }

    // Medium bot miss logic
    if (config.missVariance >= 2) {
      // 10% complete miss
      if (missType < 0.10) {
        return createDart(0, 1)
      }
      // 50% single instead of double/triple
      if (missType < 0.60 && target.multiplier > 1) {
        return createDart(target.score, 1)
      }
      // 30% adjacent segment
      if (missType < 0.90) {
        const adjacency = DARTBOARD_ADJACENCY[target.score]
        if (adjacency) {
          const adjacentScore = adjacency[Math.floor(Math.random() * 2)]
          return createDart(adjacentScore, 1)
        }
      }
      // 10% single of target
      return createDart(target.score, 1)
    }

    // Pro bot miss logic (very tight)
    // 70% single instead of double/triple
    if (missType < 0.70 && target.multiplier > 1) {
      return createDart(target.score, 1)
    }

    // 30% adjacent segment
    const adjacency = DARTBOARD_ADJACENCY[target.score]
    if (adjacency) {
      const adjacentScore = adjacency[Math.floor(Math.random() * 2)]
      return createDart(adjacentScore, 1)
    }

    // Default: hit single of original target
    return createDart(target.score, 1)
  }

  /**
   * Create a Dart object from score and multiplier
   */
  const createDart = (score: number, multiplier: 1 | 2 | 3): Dart => {
    const totalValue = calculateDartValue(score, multiplier)
    const segment = getDartSegment(score, multiplier)

    return {
      score,
      multiplier,
      totalValue,
      segment
    }
  }

  /**
   * Simulate a single dart throw
   */
  const simulateThrow = (target: DartTarget, config: BotConfig): Dart => {
    const hitRate = getHitRate(target, config)

    if (Math.random() < hitRate) {
      // Hit!
      return createDart(target.score, target.multiplier)
    } else {
      // Miss
      return generateMiss(target, config)
    }
  }

  /**
   * Determine optimal target based on remaining score and situation
   */
  const determineTarget = (
    remaining: number,
    config: BotConfig,
    settings: GameSettings,
    hasStarted: boolean,
    dartsThrown: number
  ): DartTarget => {
    // Double-In: Must hit a double first
    if (!hasStarted && settings.doubleIn) {
      // Easy bots aim at D20, pros might go for D16 (bigger target)
      return config.difficulty === 'easy'
        ? { score: 16, multiplier: 2 }
        : { score: 20, multiplier: 2 }
    }

    // Check if in checkout range
    const dartsLeft = 3 - dartsThrown
    if (remaining <= 170 && hasCheckout(remaining)) {
      const checkouts = getCheckouts(remaining)
      if (checkouts.length > 0) {
        const checkout = checkouts[0]  // Take easiest checkout
        const checkoutDarts = checkout.darts

        // If we have enough darts for this checkout, use it
        if (checkoutDarts.length <= dartsLeft) {
          const targetDart = parseCheckoutDart(checkoutDarts[0])
          return targetDart
        }
      }
    }

    // Setup: Try to leave a good checkout score
    if (remaining > 170) {
      // Easy bot aims for single 20 or random high singles - doesn't know better
      if (config.difficulty === 'easy') {
        const easyTargets = [20, 19, 18, 17, 16]
        const randomTarget = easyTargets[Math.floor(Math.random() * easyTargets.length)]
        return { score: randomTarget, multiplier: 1 }
      }

      // Medium/Pro: High scoring with trebles
      if (Math.random() < 0.85 || config.difficulty === 'pro') {
        return { score: 20, multiplier: 3 }
      } else {
        return { score: 19, multiplier: 3 }
      }
    }

    // In range but no direct checkout - try to set up
    if (remaining > 100) {
      // Easy bot still aims for singles
      if (config.difficulty === 'easy') {
        return { score: 20, multiplier: 1 }
      }
      // Medium/Pro aim for trebles
      return { score: 20, multiplier: 3 }
    }

    // Close range (41-100): Try to leave a double
    if (remaining > 40) {
      // Easy bot just aims at single 20
      if (config.difficulty === 'easy') {
        return { score: 20, multiplier: 1 }
      }
      // Medium/Pro try to set up a good double
      const targetLeave = remaining <= 60 ? remaining - 20 : 32  // Leave D16
      if (targetLeave > 0 && targetLeave <= 20) {
        return { score: remaining - 32, multiplier: 1 }
      }
      return { score: 20, multiplier: 1 }
    }

    // Very close (2-40): Go for double finish
    if (remaining <= 40 && remaining >= 2 && remaining % 2 === 0) {
      return { score: remaining / 2, multiplier: 2 }
    }

    // Odd number under 40: Hit single to leave even
    if (remaining <= 40 && remaining % 2 === 1) {
      return { score: 1, multiplier: 1 }
    }

    // Fallback: T20
    return { score: 20, multiplier: 3 }
  }

  /**
   * Generate a complete bot turn (up to 3 darts)
   */
  const generateBotTurn = (
    remainingScore: number,
    difficulty: BotDifficulty,
    settings: GameSettings,
    hasStarted: boolean
  ): Dart[] => {
    const config = BOT_CONFIGS[difficulty]
    const darts: Dart[] = []
    let currentRemaining = remainingScore
    let playerHasStarted = hasStarted

    for (let i = 0; i < 3; i++) {
      // Already checked out
      if (currentRemaining === 0) break

      // Determine target
      const target = determineTarget(
        currentRemaining,
        config,
        settings,
        playerHasStarted,
        i
      )

      // Simulate throw
      const dart = simulateThrow(target, config)
      darts.push(dart)

      // Handle double-in
      if (!playerHasStarted && settings.doubleIn) {
        if (dart.multiplier === 2 && dart.totalValue > 0) {
          // Hit a double! Player has started
          playerHasStarted = true
          currentRemaining -= dart.totalValue
        }
        // If not a double, score doesn't count but dart was thrown
        continue
      }

      // Calculate new remaining
      const newRemaining = currentRemaining - dart.totalValue

      // Check for bust
      if (isBust([dart], currentRemaining, settings)) {
        // Bust - turn ends, score reverts (handled by game store)
        break
      }

      currentRemaining = newRemaining

      // Check for checkout
      if (currentRemaining === 0) {
        // Verify it's a valid checkout
        if (settings.doubleOut && dart.multiplier !== 2) {
          // Invalid checkout - this is handled as bust
          break
        }
        // Valid checkout!
        break
      }
    }

    return darts
  }

  /**
   * Get random delay between darts for realistic timing
   */
  const getThinkingDelay = (difficulty: BotDifficulty): number => {
    const config = BOT_CONFIGS[difficulty]
    const [min, max] = config.thinkingDelayMs
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  return {
    generateBotTurn,
    getThinkingDelay,
    simulateThrow,
    determineTarget,
    createDart
  }
}
