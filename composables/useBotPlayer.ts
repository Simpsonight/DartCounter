import type { Dart } from '~/types/score'
import type { GameSettings } from '~/types/game'
import type { BotDifficulty } from '~/types/bot'

/**
 * Bot Player Composable
 *
 * Orchestrates bot turn execution with realistic timing and dart-by-dart animation.
 * Provides callbacks for each dart thrown to enable UI updates.
 */
export const useBotPlayer = () => {
  const { generateBotTurn, getThinkingDelay } = useBotDartGenerator()

  // State
  const isExecuting = ref(false)
  const currentDartIndex = ref(0)
  const thrownDarts = ref<Dart[]>([])

  /**
   * Wait for a specified duration
   */
  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Execute a bot turn with dart-by-dart animation
   *
   * @param remainingScore Current remaining score for the bot
   * @param difficulty Bot difficulty level
   * @param settings Game settings (doubleIn, doubleOut)
   * @param hasStarted Whether bot has started scoring (for double-in)
   * @param onDartThrown Callback fired after each dart is thrown
   * @param onTurnComplete Callback fired when turn is complete
   */
  const executeBotTurn = async (
    remainingScore: number,
    difficulty: BotDifficulty,
    settings: GameSettings,
    hasStarted: boolean,
    onDartThrown?: (dart: Dart, dartIndex: number) => void,
    onTurnComplete?: (darts: Dart[]) => void
  ): Promise<Dart[]> => {
    if (isExecuting.value) {
      console.warn('Bot turn already in progress')
      return []
    }

    isExecuting.value = true
    currentDartIndex.value = 0
    thrownDarts.value = []

    try {
      // Generate all darts for this turn upfront
      const allDarts = generateBotTurn(remainingScore, difficulty, settings, hasStarted)

      // Throw each dart with delay
      for (let i = 0; i < allDarts.length; i++) {
        // Thinking delay before throw
        const thinkingTime = getThinkingDelay(difficulty)
        await delay(thinkingTime)

        const dart = allDarts[i]
        thrownDarts.value.push(dart)
        currentDartIndex.value = i + 1

        // Callback for UI update
        if (onDartThrown) {
          onDartThrown(dart, i)
        }

        // Small delay after throw for visual feedback
        await delay(200)
      }

      // Turn complete callback
      if (onTurnComplete) {
        onTurnComplete([...thrownDarts.value])
      }

      return [...thrownDarts.value]
    } finally {
      isExecuting.value = false
      currentDartIndex.value = 0
      thrownDarts.value = []
    }
  }

  /**
   * Cancel current bot turn execution
   * Note: This doesn't actually stop the execution mid-turn,
   * but resets the state for a fresh start
   */
  const cancelExecution = () => {
    isExecuting.value = false
    currentDartIndex.value = 0
    thrownDarts.value = []
  }

  /**
   * Check if a player is a bot based on their ID
   */
  const isBotPlayer = (playerId: string): boolean => {
    return playerId.startsWith('bot-')
  }

  /**
   * Extract bot difficulty from player ID
   */
  const getBotDifficultyFromPlayerId = (playerId: string): BotDifficulty | null => {
    if (!isBotPlayer(playerId)) return null

    const parts = playerId.split('-')
    if (parts.length >= 2) {
      const difficulty = parts[1] as BotDifficulty
      if (['easy', 'medium', 'pro'].includes(difficulty)) {
        return difficulty
      }
    }
    return null
  }

  return {
    // State
    isExecuting: readonly(isExecuting),
    currentDartIndex: readonly(currentDartIndex),
    thrownDarts: readonly(thrownDarts),

    // Methods
    executeBotTurn,
    cancelExecution,
    isBotPlayer,
    getBotDifficultyFromPlayerId
  }
}
