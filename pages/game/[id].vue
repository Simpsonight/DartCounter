<template>
  <div class="min-h-screen bg-slate-950 safe-top safe-bottom pb-20">
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
    <div v-else-if="isGameActive">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        <div class="max-w-2xl mx-auto px-4 py-3">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-white">
              {{ currentGame.mode }} Game
            </h1>
            <button
              @click="showExitConfirm = true"
              class="p-2 text-slate-400 hover:text-dart-red transition-colors"
              title="Exit game"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <!-- Player Cards -->
        <div class="space-y-3">
          <GamePlayerCard
            v-for="(player, index) in currentGame.players"
            :key="player.playerId"
            :player="player"
            :is-active="index === currentGame.currentPlayerIndex"
            :current-darts="getDartsForPlayer(player.playerId)"
          />
        </div>

        <!-- Game Stats Summary -->
        <div class="card bg-slate-900/50">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-white">{{ currentGame.mode }}</div>
              <div class="text-xs text-slate-400">Mode</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-white">{{ totalRounds }}</div>
              <div class="text-xs text-slate-400">Rounds</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-white">{{ totalDarts }}</div>
              <div class="text-xs text-slate-400">Total Darts</div>
            </div>
          </div>
        </div>

        <!-- Checkout Suggestions -->
        <GameCheckoutSuggestions
          v-if="currentPlayer"
          :remaining-score="provisionalScore"
        />

        <!-- Score Entry -->
        <GameScoreEntry
          v-if="currentPlayer"
          ref="scoreEntryRef"
          :remaining-score="currentPlayer.remainingScore"
          :can-delete="canDelete"
          @dart-thrown="handleDartThrown"
          @turn-complete="handleTurnComplete"
          @delete="handleDeleteLast"
        />
      </div>
    </div>

    <!-- Game Completed -->
    <div v-else-if="currentGame.status === 'completed'" class="flex items-center justify-center min-h-screen">
      <div class="card text-center max-w-md">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-3xl font-bold text-white mb-2">Game Over!</h2>
        <div class="my-6">
          <PlayerAvatar
            v-if="winner"
            :name="winner.playerName"
            :avatar="winner.playerAvatar"
            size="xl"
            class="mx-auto mb-4"
          />
          <p class="text-2xl font-bold text-primary-400">
            {{ winner?.playerName }} Wins!
          </p>
        </div>

        <!-- Game Stats -->
        <div class="grid grid-cols-2 gap-4 my-6 p-4 bg-slate-800 rounded-lg">
          <div>
            <div class="text-2xl font-bold text-white">{{ winner?.dartCount }}</div>
            <div class="text-sm text-slate-400">Darts Thrown</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ winner?.averageScore.toFixed(1) }}</div>
            <div class="text-sm text-slate-400">Average</div>
          </div>
        </div>

        <div class="space-y-3">
          <UiButton variant="primary" full-width @click="navigateTo('/game/new')">
            New Game
          </UiButton>
          <UiButton variant="secondary" full-width @click="navigateTo('/')">
            Back to Home
          </UiButton>
        </div>
      </div>
    </div>

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
const { currentGame, loading, currentPlayer, isGameActive, canUndo, winner } = storeToRefs(gameStore)

useHead({
  title: () => currentGame.value ? `${currentGame.value.mode} Game` : 'Game'
})

const showExitConfirm = ref(false)
const currentDarts = ref<Dart[]>([])
const dartHistory = ref<Array<{ dart: Dart, playerId: string, playerIndex: number, isSubmitted: boolean }>>([])
const scoreEntryRef = ref<{ currentDarts: Dart[] } | null>(null)
const lastDartsPerPlayer = ref<Map<string, Dart[]>>(new Map())

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

// Calculate provisional score (current player's remaining score minus current turn total)
const provisionalScore = computed(() => {
  if (!currentPlayer.value) return 0

  // If there are darts in the current turn, subtract their total
  if (currentDarts.value.length > 0) {
    const turnTotal = currentDarts.value.reduce((sum, dart) => sum + dart.totalValue, 0)
    return Math.max(0, currentPlayer.value.remainingScore - turnTotal)
  }

  // Otherwise return the actual remaining score
  return currentPlayer.value.remainingScore
})

// Load game on mount
onMounted(async () => {
  await gameStore.loadGame(gameId)

  // If game not found, redirect to home after a short delay
  if (!currentGame.value) {
    setTimeout(() => {
      navigateTo('/')
    }, 2000)
  }
})

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
const handleTurnComplete = async (darts: Dart[]) => {
  try {
    if (!currentGame.value) return

    const currentPlayerId = currentGame.value.players[currentGame.value.currentPlayerIndex].playerId

    // Save the darts for this player before recording the turn
    lastDartsPerPlayer.value.set(currentPlayerId, [...darts])

    await gameStore.recordTurn(darts)

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
    alert(error instanceof Error ? error.message : 'Failed to submit score')
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

// Prevent accidental navigation
onBeforeRouteLeave((to, from, next) => {
  if (isGameActive.value && !showExitConfirm.value) {
    const answer = confirm('Leave the game? Your progress will be lost.')
    if (answer) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})
</script>
