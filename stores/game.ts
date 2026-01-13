import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { Game, GameMode, GamePlayer, GameSettings } from '~/types/game'
import type { Turn, Dart } from '~/types/score'
import type { Player } from '~/types/player'
import { GAME_MODES } from '~/utils/constants'

export const useGameStore = defineStore('game', () => {
  const currentGame = ref<Game | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { validateScoreEntry } = useScoreValidation()
  const { add, put, get, remove } = useIndexedDB()

  /**
   * Create a new game
   */
  const createGame = async (
    mode: GameMode,
    players: Player[],
    settings: GameSettings
  ): Promise<Game> => {
    loading.value = true
    error.value = null

    try {
      const gameId = uuidv4()
      const startingScore = GAME_MODES[mode]

      const gamePlayers: GamePlayer[] = players.map(player => ({
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        remainingScore: startingScore,
        turnCount: 0,
        dartCount: 0,
        averageScore: 0,
        checkoutAttempts: 0,
        successfulCheckouts: 0
      }))

      const game: Game = {
        id: gameId,
        mode,
        status: 'active',
        players: gamePlayers,
        currentPlayerIndex: 0,
        turns: [],
        settings,
        startedAt: new Date()
      }

      // Save to IndexedDB
      await add('activeGames', game)

      currentGame.value = game
      return game
    } catch (e) {
      error.value = 'Failed to create game'
      console.error('Error creating game:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Load a game by ID
   */
  const loadGame = async (gameId: string): Promise<Game | undefined> => {
    loading.value = true
    error.value = null

    try {
      const game = await get('activeGames', gameId)
      if (game) {
        currentGame.value = game
      }
      return game
    } catch (e) {
      error.value = 'Failed to load game'
      console.error('Error loading game:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Record a turn for the current player
   */
  const recordTurn = async (darts: Dart[]): Promise<void> => {
    if (!currentGame.value) {
      throw new Error('No active game')
    }

    const game = currentGame.value
    const currentPlayer = game.players[game.currentPlayerIndex]

    // Validate score entry
    const validation = validateScoreEntry(
      darts,
      currentPlayer.remainingScore,
      game.settings
    )

    if (!validation.isValid) {
      throw new Error(validation.errorMessage || 'Invalid score')
    }

    // Create turn record
    const turn: Turn = {
      id: uuidv4(),
      gameId: game.id,
      playerId: currentPlayer.playerId,
      turnNumber: currentPlayer.turnCount + 1,
      darts,
      scoreBeforeTurn: currentPlayer.remainingScore,
      scoreAfterTurn: validation.isBust
        ? currentPlayer.remainingScore
        : currentPlayer.remainingScore - validation.totalScore,
      totalScore: validation.totalScore,
      isBust: validation.isBust,
      isCheckout: validation.isCheckout,
      timestamp: new Date()
    }

    // Update player stats
    if (!validation.isBust) {
      currentPlayer.remainingScore -= validation.totalScore
      currentPlayer.dartCount += darts.length
      currentPlayer.turnCount += 1

      // Update average
      if (currentPlayer.turnCount > 0) {
        const totalScored = GAME_MODES[game.mode] - currentPlayer.remainingScore
        currentPlayer.averageScore = totalScored / currentPlayer.turnCount
      }

      // Track checkout attempts
      if (currentPlayer.remainingScore <= 170) {
        currentPlayer.checkoutAttempts += 1
        if (validation.isCheckout) {
          currentPlayer.successfulCheckouts += 1
        }
      }
    } else {
      // Bust - still count the turn
      currentPlayer.turnCount += 1
    }

    // Add turn to history
    game.turns.push(turn)

    // Check for game completion
    if (validation.isCheckout) {
      game.status = 'completed'
      game.completedAt = new Date()
      game.winnerId = currentPlayer.playerId

      // TODO: Save to match history
      // TODO: Update player statistics
    } else {
      // Move to next player
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length
    }

    // Save updated game
    await put('activeGames', game)
    currentGame.value = { ...game }
  }

  /**
   * Undo last turn
   */
  const undoLastTurn = async (): Promise<void> => {
    if (!currentGame.value || currentGame.value.turns.length === 0) {
      return
    }

    const game = currentGame.value
    const lastTurn = game.turns[game.turns.length - 1]

    // Find the player who threw the last turn
    const playerIndex = game.players.findIndex(p => p.playerId === lastTurn.playerId)
    if (playerIndex === -1) return

    const player = game.players[playerIndex]

    // Revert player stats
    player.remainingScore = lastTurn.scoreBeforeTurn
    player.turnCount = Math.max(0, player.turnCount - 1)

    if (!lastTurn.isBust) {
      player.dartCount = Math.max(0, player.dartCount - lastTurn.darts.length)

      // Recalculate average
      if (player.turnCount > 0) {
        const totalScored = GAME_MODES[game.mode] - player.remainingScore
        player.averageScore = totalScored / player.turnCount
      } else {
        player.averageScore = 0
      }

      // Revert checkout stats
      if (lastTurn.isCheckout) {
        player.successfulCheckouts = Math.max(0, player.successfulCheckouts - 1)
      }
      if (lastTurn.scoreBeforeTurn <= 170) {
        player.checkoutAttempts = Math.max(0, player.checkoutAttempts - 1)
      }
    }

    // Remove the turn
    game.turns.pop()

    // Revert to previous player
    game.currentPlayerIndex = playerIndex

    // If game was completed, reactivate it
    if (game.status === 'completed') {
      game.status = 'active'
      game.completedAt = undefined
      game.winnerId = undefined
    }

    // Save updated game
    await put('activeGames', game)
    currentGame.value = { ...game }
  }

  /**
   * Delete/abandon current game
   */
  const abandonGame = async (): Promise<void> => {
    if (!currentGame.value) return

    try {
      await remove('activeGames', currentGame.value.id)
      currentGame.value = null
    } catch (e) {
      console.error('Error abandoning game:', e)
      throw e
    }
  }

  // Computed properties
  const currentPlayer = computed(() => {
    if (!currentGame.value) return null
    return currentGame.value.players[currentGame.value.currentPlayerIndex]
  })

  const isGameActive = computed(() => {
    return currentGame.value?.status === 'active'
  })

  const canUndo = computed(() => {
    return currentGame.value && currentGame.value.turns.length > 0
  })

  const winner = computed(() => {
    if (!currentGame.value?.winnerId) return null
    return currentGame.value.players.find(p => p.playerId === currentGame.value?.winnerId)
  })

  return {
    // State
    currentGame,
    loading,
    error,

    // Computed
    currentPlayer,
    isGameActive,
    canUndo,
    winner,

    // Actions
    createGame,
    loadGame,
    recordTurn,
    undoLastTurn,
    abandonGame
  }
})
