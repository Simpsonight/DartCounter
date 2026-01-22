<template>
  <div class="min-h-screen bg-slate-950 safe-top">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-block animate-spin text-4xl mb-4">⟳</div>
        <p class="text-slate-400">Loading game...</p>
      </div>
    </div>

    <!-- Game Not Found -->
    <div v-else-if="!currentGame" class="flex items-center justify-center min-h-screen">
      <div class="card text-center max-w-md">
        <div class="text-6xl mb-4">🤷</div>
        <h2 class="text-2xl font-bold text-white mb-2">Game Not Found</h2>
        <p class="text-slate-400 mb-6">
          This game doesn't exist or has been deleted.
        </p>
        <UiButton variant="primary" @click="navigateTo('/')">
          Back to Home
        </UiButton>
      </div>
    </div>

    <!-- Active Game -->
    <div v-else-if="isGameActive" class="flex flex-col h-screen">
      <!-- Header (fixed height) -->
      <GameHeader
        :title="`${currentGame.mode} Game`"
        @exit="showExitConfirm = true"
      />

      <!-- Scrollable Content Area -->
      <div ref="scrollContainerRef" class="flex-1 overflow-y-auto overscroll-contain">
        <div class="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-3">
          <!-- Player Cards -->
          <div class="space-y-2">
            <GamePlayerCard
              v-for="(player, index) in currentGame.players"
              :key="player.playerId"
              :ref="el => setPlayerCardRef(el, index)"
              :player="player"
              :is-active="index === currentGame.currentPlayerIndex"
              :current-darts="getDartsForPlayer(player.playerId)"
              :game-settings="currentGame.settings"
            />
          </div>

          <!-- Sets & Legs Display (if more than 1 set or leg) -->
          <div v-if="showSetsLegs" class="card bg-slate-900/50 border-l-4 border-l-primary-500 py-3">
            <div class="flex items-center justify-between mb-2">
              <div>
                <div class="text-xs text-slate-400">Match Status</div>
                <div class="text-lg font-bold text-white">
                  Set {{ currentGame.currentSet }} - Leg {{ currentGame.currentLeg }}
                </div>
              </div>
            </div>

            <!-- Sets/Legs won by each player (compact) -->
            <div class="flex gap-2 text-xs">
              <div
                v-for="player in currentGame.players"
                :key="player.playerId"
                class="flex-1 p-2 bg-slate-800 rounded"
              >
                <div class="font-medium text-white truncate">{{ player.playerName }}</div>
                <div class="text-slate-400">
                  S: <span class="text-white font-bold">{{ currentGame.setsWon[player.playerId] || 0 }}</span>
                  L: <span class="text-white font-bold">{{ currentGame.legsWon[player.playerId] || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Game Stats Summary (more compact) -->
          <div class="card bg-slate-900/50 py-2">
            <div class="grid grid-cols-3 gap-2 text-center">
              <div>
                <div class="text-xl font-bold text-white">{{ currentGame.mode }}</div>
                <div class="text-xs text-slate-400">Mode</div>
              </div>
              <div>
                <div class="text-xl font-bold text-white">{{ totalRounds }}</div>
                <div class="text-xs text-slate-400">Rounds</div>
              </div>
              <div>
                <div class="text-xl font-bold text-white">{{ totalDarts }}</div>
                <div class="text-xs text-slate-400">Darts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Bottom: Checkout Suggestions + Score Entry -->
      <div class="flex-shrink-0 bg-slate-950 border-t border-slate-800 safe-bottom">
        <!-- Checkout Suggestions (compact bar) - only shown if enabled in settings -->
        <GameCheckoutSuggestions
          v-if="currentPlayer && showCheckoutHints"
          :remaining-score="provisionalScore"
          :darts-thrown="currentDarts.length"
        />

        <!-- Score Entry with Numpad (only for human players) -->
        <div class="max-w-2xl mx-auto px-4 py-3">
          <!-- Bot Turn Indicator -->
          <div v-if="isCurrentPlayerBot && isBotExecuting" class="text-center py-6">
            <div class="text-4xl mb-3 animate-bounce">🤖</div>
            <p class="text-lg text-primary-400 animate-pulse">{{ currentPlayer?.playerName }} wirft...</p>
          </div>

          <!-- Waiting for Bot to Start -->
          <div v-else-if="isCurrentPlayerBot && !isBotExecuting" class="text-center py-6">
            <div class="text-4xl mb-3">🎯</div>
            <p class="text-slate-400">{{ currentPlayer?.playerName }} ist am Zug...</p>
          </div>

          <!-- Human Player Score Entry -->
          <GameScoreEntry
            v-else-if="currentPlayer"
            ref="scoreEntryRef"
            :remaining-score="currentPlayer.remainingScore"
            :game-settings="currentGame.settings"
            :has-started="currentPlayer.hasStarted"
            :can-delete="canDelete"
            @dart-thrown="handleDartThrown"
            @turn-complete="handleTurnComplete"
            @delete="handleDeleteLast"
          />
        </div>
      </div>
    </div>

    <!-- Game Completed -->
    <GameCompletedScreen
      v-else-if="currentGame.status === 'completed'"
      :winner="winner"
      :players="currentGame.players"
      :turns="currentGame.turns"
      @new-game="navigateTo('/game/new')"
      @view-history="navigateTo('/history')"
      @go-home="navigateTo('/')"
    />

    <!-- Exit Confirmation Modal -->
    <UiModal
      :is-open="showExitConfirm"
      title="Exit Game"
      @close="showExitConfirm = false"
    >
      <div class="space-y-4">
        <p class="text-slate-300">
          Are you sure you want to exit this game? Your progress will be lost.
        </p>

        <div class="flex gap-3 pt-2">
          <UiButton
            variant="danger"
            @click="handleAbandonGame"
            full-width
          >
            Exit Game
          </UiButton>
          <UiButton
            variant="ghost"
            @click="showExitConfirm = false"
          >
            Cancel
          </UiButton>
        </div>
      </div>
    </UiModal>

  </div>
</template>

<script setup lang="ts">
import type { Dart } from '~/types/score'

const route = useRoute()
const gameId = route.params.id as string

const gameStore = useGameStore()
const settingsStore = useSettingsStore()
const { currentGame, loading, currentPlayer, isGameActive, isCurrentPlayerBot, winner } = storeToRefs(gameStore)
const { showCheckoutHints } = storeToRefs(settingsStore)

// Bot player handling
const { executeBotTurn, isExecuting: isBotExecuting } = useBotPlayer()

useHead({
  title: () => currentGame.value ? `${currentGame.value.mode} Game` : 'Game'
})

const showExitConfirm = ref(false)
const currentDarts = ref<Dart[]>([])
const dartHistory = ref<Array<{ dart: Dart, playerId: string, playerIndex: number, isSubmitted: boolean }>>([])
const scoreEntryRef = ref<{ currentDarts: Dart[] } | null>(null)
const lastDartsPerPlayer = ref<Map<string, Dart[]>>(new Map())

// Refs for auto-scrolling to active player
const scrollContainerRef = ref<HTMLElement | null>(null)
const playerCardRefs = ref<Map<number, HTMLElement>>(new Map())

// Store player card refs
const setPlayerCardRef = (el: any, index: number) => {
  if (el?.$el) {
    playerCardRefs.value.set(index, el.$el)
  } else if (el) {
    playerCardRefs.value.set(index, el)
  }
}

// Scroll to active player when player changes
const scrollToActivePlayer = () => {
  if (!currentGame.value || !scrollContainerRef.value) return

  const activeIndex = currentGame.value.currentPlayerIndex
  const activeCard = playerCardRefs.value.get(activeIndex)

  if (activeCard) {
    // Scroll the active card into view with smooth animation
    // Use 'start' to ensure the card is at the top of the scrollable area
    // This prevents it from being hidden behind the fixed bottom numpad
    activeCard.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// Watch for player changes and scroll to active player
watch(() => currentGame.value?.currentPlayerIndex, (newIndex, oldIndex) => {
  if (newIndex !== oldIndex && newIndex !== undefined) {
    // Small delay to ensure DOM is updated
    nextTick(() => {
      scrollToActivePlayer()
    })
  }
})

// Show sets/legs display if playing more than 1 set or 1 leg
const showSetsLegs = computed(() => {
  if (!currentGame.value) return false
  const sets = currentGame.value.settings.sets || 1
  const legs = currentGame.value.settings.legs || 1
  return sets > 1 || legs > 1
})

// Computed properties for game stats
const totalRounds = computed(() => {
  if (!currentGame.value) return 0
  // Round increments when player 1 is active again (after all players have played)
  // Round 1: Player 1 is active (turnCount=0)
  // Round 2: Player 1 is active again (turnCount=1)
  const firstPlayer = currentGame.value.players[0]
  const isFirstPlayerActive = currentGame.value.currentPlayerIndex === 0

  // If player 1 is active, show their turnCount + 1 (current round)
  // If player 1 is not active, show their turnCount (they haven't started the next round yet)
  return isFirstPlayerActive ? firstPlayer.turnCount + 1 : firstPlayer.turnCount
})

const totalDarts = computed(() => {
  if (!currentGame.value) return 0
  return currentGame.value.players.reduce((sum, p) => sum + p.dartCount, 0)
})

const canDelete = computed(() => {
  return currentDarts.value.length > 0 || dartHistory.value.length > 0
})

// Helper to get sets won by other players
const getSetsWonByOthers = (playerId: string): number => {
  if (!currentGame.value) return 0
  return Math.max(
    ...Object.entries(currentGame.value.setsWon)
      .filter(([id]) => id !== playerId)
      .map(([_, count]) => count)
  )
}

// Calculate provisional score using shared composable
const { calculateProvisionalScore } = useDisplayScore()

const provisionalScore = computed(() => {
  if (!currentPlayer.value || !currentGame.value) return 0

  return calculateProvisionalScore(
    currentPlayer.value.remainingScore,
    currentDarts.value,
    currentGame.value.settings,
    currentPlayer.value.hasStarted
  )
})

// Load game on mount
onMounted(async () => {
  await gameStore.loadGame(gameId)

  // If game not found, redirect to home after a short delay
  if (!currentGame.value) {
    setTimeout(() => {
      navigateTo('/')
    }, 2000)
    return
  }

  // Check if current player is a bot and execute their turn
  if (isCurrentPlayerBot.value && isGameActive.value) {
    await executeBotTurnIfNeeded()
  }
})

// Watch for player changes to trigger bot turns
watch([() => currentGame.value?.currentPlayerIndex, isGameActive], async ([newIndex, gameActive], [oldIndex]) => {
  if (newIndex !== oldIndex && gameActive && isCurrentPlayerBot.value) {
    // Small delay before bot starts their turn
    await new Promise(resolve => setTimeout(resolve, 500))
    await executeBotTurnIfNeeded()
  }
})

// Execute bot turn if current player is a bot
const executeBotTurnIfNeeded = async () => {
  if (!currentGame.value || !currentPlayer.value || !isCurrentPlayerBot.value || !isGameActive.value) {
    return
  }

  const botPlayer = currentPlayer.value
  if (!botPlayer.botDifficulty) return

  // Execute bot turn with callbacks for dart-by-dart animation
  await executeBotTurn(
    botPlayer.remainingScore,
    botPlayer.botDifficulty,
    currentGame.value.settings,
    botPlayer.hasStarted,
    // onDartThrown callback - update UI as each dart is thrown
    (dart: Dart, _dartIndex: number) => {
      currentDarts.value.push(dart)

      // Add to dart history
      if (currentGame.value) {
        dartHistory.value.push({
          dart,
          playerId: botPlayer.playerId,
          playerIndex: currentGame.value.currentPlayerIndex,
          isSubmitted: false
        })
      }
    },
    // onTurnComplete callback - submit the turn
    async (darts: Dart[]) => {
      await handleTurnComplete(darts)
    }
  )
}

// Helper to get darts for a specific player
const getDartsForPlayer = (playerId: string): Dart[] => {
  if (!currentGame.value) return []

  // If this is the active player, show current darts first
  if (currentGame.value.players[currentGame.value.currentPlayerIndex]?.playerId === playerId) {
    // If we have current darts being entered, show those
    if (currentDarts.value.length > 0) {
      return currentDarts.value
    }
    // Otherwise show the last darts from their last turn
    return lastDartsPerPlayer.value.get(playerId) || []
  }

  // For inactive players, show the last darts for this player
  return lastDartsPerPlayer.value.get(playerId) || []
}

// Handle dart thrown (for live update)
const handleDartThrown = (dart: Dart) => {
  if (!currentGame.value) return

  currentDarts.value.push(dart)

  // Add to history (keep max 9 entries)
  dartHistory.value.push({
    dart,
    playerId: currentGame.value.players[currentGame.value.currentPlayerIndex].playerId,
    playerIndex: currentGame.value.currentPlayerIndex,
    isSubmitted: false
  })

  if (dartHistory.value.length > 9) {
    dartHistory.value.shift()
  }
}

// Handle turn completion
const toast = useToast()
const sound = useSound()

const handleTurnComplete = async (darts: Dart[]) => {
  try {
    if (!currentGame.value) return

    const currentPlayerId = currentGame.value.players[currentGame.value.currentPlayerIndex].playerId
    const currentPlayerName = currentGame.value.players[currentGame.value.currentPlayerIndex].playerName

    // Calculate turn total for sound effects
    const turnTotal = darts.reduce((sum, dart) => sum + dart.totalValue, 0)

    // Save the darts for this player before recording the turn
    lastDartsPerPlayer.value.set(currentPlayerId, [...darts])

    await gameStore.recordTurn(darts)

    // Check if it was a bust (the turn would be in the game turns now)
    const lastTurn = currentGame.value.turns[currentGame.value.turns.length - 1]
    if (lastTurn && lastTurn.isBust) {
      // Play bust sound
      sound.playBust()
      toast.warning(
        `${currentPlayerName}'s turn was void. Score remains at ${lastTurn.scoreBeforeTurn}.`,
        'BUST!'
      )
    } else if (lastTurn && lastTurn.isCheckout) {
      // Player won a leg!
      const legsWon = currentGame.value.legsWon[currentPlayerId] || 0
      const legsNeeded = Math.ceil((currentGame.value.settings.legs || 1) / 2)

      if (legsWon >= legsNeeded) {
        // Player won a set!
        const setsWon = currentGame.value.setsWon[currentPlayerId] || 0
        const setsNeeded = Math.ceil((currentGame.value.settings.sets || 1) / 2)

        if (setsWon >= setsNeeded) {
          // Player won the match! Play victory fanfare
          sound.playWinMatch()
          toast.success(
            `${currentPlayerName} wins the match ${setsWon}-${getSetsWonByOthers(currentPlayerId)}!`,
            '🏆 MATCH WON!'
          )
        } else {
          // Player won the set, but not the match
          sound.playCheckout()
          toast.success(
            `${currentPlayerName} wins Set ${currentGame.value.currentSet - 1}! Score: ${setsWon}-${getSetsWonByOthers(currentPlayerId)}`,
            '🎯 SET WON!'
          )
        }
      } else {
        // Player won the leg only - play checkout sound
        sound.playCheckout()
        const totalLegs = currentGame.value.settings.legs || 1
        if (totalLegs > 1) {
          toast.success(
            `${currentPlayerName} wins Leg ${currentGame.value.currentLeg - 1} with a checkout of ${lastTurn.totalScore}!`,
            '✓ LEG WON!'
          )
        } else {
          // Single leg game - just show checkout
          toast.success(
            `${currentPlayerName} wins with a checkout of ${lastTurn.totalScore}!`,
            'CHECKOUT!'
          )
        }
      }
    } else if (lastTurn && !lastTurn.isBust) {
      // Normal turn completed - check for high scores
      if (turnTotal === 180) {
        // Maximum score! Play epic 180 sound
        sound.play180()
        toast.success(`${currentPlayerName} scores ONE HUNDRED AND EIGHTY!`, '🎯 180!')
      } else if (turnTotal >= 140) {
        // High score 140+
        sound.playHighScore()
      } else if (turnTotal >= 100) {
        // Good score 100+
        sound.playConfirm()
      }
    }

    // Mark all current darts as submitted in history
    for (const dart of darts) {
      const historyEntry = dartHistory.value.find(h => h.dart === dart && !h.isSubmitted)
      if (historyEntry) {
        historyEntry.isSubmitted = true
      }
    }

    // Clear current darts after successful turn (but keep history for undo)
    currentDarts.value = []

    // Clear all dart slots when a new round starts (when player 1 becomes active again)
    if (currentGame.value && currentGame.value.currentPlayerIndex === 0) {
      lastDartsPerPlayer.value.clear()
    }
  } catch (error) {
    console.error('Failed to submit score:', error)
    toast.error(
      error instanceof Error ? error.message : 'Failed to submit score',
      'Error'
    )
  }
}

// Handle delete last dart (across turns)
const handleDeleteLast = async () => {
  if (dartHistory.value.length === 0) return

  const lastEntry = dartHistory.value.pop()
  if (!lastEntry || !currentGame.value) return

  if (!lastEntry.isSubmitted) {
    // Dart is in current turn - remove from both local and ScoreEntry's currentDarts
    const dartIndex = currentDarts.value.indexOf(lastEntry.dart)
    if (dartIndex !== -1) {
      currentDarts.value.splice(dartIndex, 1)
    }

    // Also remove from ScoreEntry's internal currentDarts
    if (scoreEntryRef.value?.currentDarts) {
      const entryDartIndex = scoreEntryRef.value.currentDarts.indexOf(lastEntry.dart)
      if (entryDartIndex !== -1) {
        scoreEntryRef.value.currentDarts.splice(entryDartIndex, 1)
      }
    }
  } else {
    // Dart was already submitted - need to undo from game store
    await gameStore.undoLastDart(lastEntry.dart, lastEntry.playerId)

    // After undo, the game store has switched back to the player who threw the dart
    // Update the lastDartsPerPlayer map and currentDarts to reflect the current state
    if (currentGame.value) {
      // Get the now-active player's ID (the one we just switched back to)
      const nowActivePlayerId = currentGame.value.players[currentGame.value.currentPlayerIndex].playerId

      // Find their last turn to show their darts
      const lastTurn = currentGame.value.turns
        .filter(t => t.playerId === nowActivePlayerId)
        .pop()

      if (lastTurn && lastTurn.darts.length > 0) {
        // Set both lastDartsPerPlayer and currentDarts with the remaining darts
        const remainingDarts = [...lastTurn.darts]
        lastDartsPerPlayer.value.set(nowActivePlayerId, remainingDarts)
        currentDarts.value = [...remainingDarts]

        // Also update ScoreEntry's internal currentDarts
        if (scoreEntryRef.value?.currentDarts) {
          scoreEntryRef.value.currentDarts = [...remainingDarts]
        }
      } else {
        // No darts left for this player, clear everything
        lastDartsPerPlayer.value.set(nowActivePlayerId, [])
        currentDarts.value = []
        if (scoreEntryRef.value?.currentDarts) {
          scoreEntryRef.value.currentDarts = []
        }
      }
    }
  }
}

// Handle abandon game
const handleAbandonGame = async () => {
  await gameStore.abandonGame()
  navigateTo('/')
}

// Prevent accidental navigation - Vue Router guard
onBeforeRouteLeave((to, from, next) => {
  if (isGameActive.value && !showExitConfirm.value) {
    showExitConfirm.value = true
    next(false)
  } else {
    next()
  }
})

// Prevent accidental tab close/refresh - Browser beforeunload event
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (isGameActive.value) {
    // Modern browsers ignore custom messages, but this triggers the dialog
    event.preventDefault()
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>
