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
        <!-- Game Board -->
        <GameBoard
          :players="currentGame.players"
          :current-player-index="currentGame.currentPlayerIndex"
          :game-mode="currentGame.mode"
        />

        <!-- Checkout Suggestions -->
        <GameCheckoutSuggestions
          v-if="currentPlayer"
          :remaining-score="currentPlayer.remainingScore"
        />

        <!-- Score Entry -->
        <GameScoreEntry
          v-if="currentPlayer"
          :remaining-score="currentPlayer.remainingScore"
          :can-undo="canUndo"
          @submit="handleScoreSubmit"
          @undo="handleUndo"
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

useHead({
  title: () => currentGame.value ? `${currentGame.value.mode} Game` : 'Game'
})

const gameStore = useGameStore()
const { currentGame, loading, currentPlayer, isGameActive, canUndo, winner } = storeToRefs(gameStore)

const showExitConfirm = ref(false)

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

// Handle score submission
const handleScoreSubmit = async (darts: Dart[]) => {
  try {
    await gameStore.recordTurn(darts)
  } catch (error) {
    console.error('Failed to submit score:', error)
    alert(error instanceof Error ? error.message : 'Failed to submit score')
  }
}

// Handle undo
const handleUndo = async () => {
  const confirmed = confirm('Undo the last turn?')
  if (confirmed) {
    await gameStore.undoLastTurn()
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
