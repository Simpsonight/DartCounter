<template>
  <div class="min-h-screen bg-slate-950 safe-top safe-bottom">
    <!-- Loading State -->
    <UiPageLoading v-if="loading" text="Loading match details..." />

    <!-- Match Not Found -->
    <div v-else-if="!match" class="flex items-center justify-center min-h-screen">
      <div class="card text-center max-w-md">
        <div class="text-6xl mb-4">🤷</div>
        <h2 class="text-2xl font-bold text-white mb-2">Match Not Found</h2>
        <p class="text-slate-400 mb-6">
          This match doesn't exist or has been deleted.
        </p>
        <UiButton variant="primary" @click="navigateTo('/history')">
          Back to History
        </UiButton>
      </div>
    </div>

    <!-- Match Details -->
    <div v-else>
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        <div class="max-w-2xl mx-auto px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button
                @click="navigateTo('/history')"
                class="p-2 text-slate-400 hover:text-white transition-colors"
                title="Back to history"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 class="text-xl font-bold text-white">{{ match.gameMode }} Match</h1>
            </div>
            <button
              @click="showDeleteConfirm = true"
              class="p-2 text-slate-400 hover:text-dart-red transition-colors"
              title="Delete match"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <!-- Winner Card -->
        <div class="card bg-gradient-to-r from-dart-gold/20 to-amber-500/20 border-dart-gold/30">
          <div class="text-center">
            <div class="text-6xl mb-4">🏆</div>
            <h2 class="text-2xl font-bold text-dart-gold mb-2">{{ winner?.playerName }} Wins!</h2>

            <!-- Show set score if more than 1 set or leg -->
            <div v-if="showSetsLegs" class="text-lg text-white mb-3">
              Final Score: {{ match.finalSetScore }}
            </div>

            <div class="flex items-center justify-center gap-6 text-sm text-slate-300">
              <div>
                <div class="font-bold text-white">{{ winner?.dartCount }}</div>
                <div>Darts</div>
              </div>
              <div>
                <div class="font-bold text-white">{{ winner?.averageScore.toFixed(1) }}</div>
                <div>Average</div>
              </div>
              <div>
                <div class="font-bold text-white">{{ winner?.highestTurnScore }}</div>
                <div>Highest</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sets & Legs Summary (if applicable) -->
        <div v-if="showSetsLegs" class="card bg-slate-900/50">
          <h3 class="text-sm font-bold text-slate-400 mb-3">Match Format</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-white">{{ match.totalSets === 1 ? '1 Set' : `Best of ${match.totalSets}` }}</div>
              <div class="text-xs text-slate-400">Sets</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-white">{{ match.totalLegs === 1 ? '1 Leg' : `Best of ${match.totalLegs}` }}</div>
              <div class="text-xs text-slate-400">Legs per Set</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-white">{{ match.finalSetScore }}</div>
              <div class="text-xs text-slate-400">Final Score</div>
            </div>
          </div>

          <!-- Sets won by each player -->
          <div class="mt-4 pt-4 border-t border-slate-800">
            <h4 class="text-xs font-bold text-slate-400 mb-2">Sets Won</h4>
            <div class="flex gap-3">
              <div
                v-for="player in match.players"
                :key="player.playerId"
                class="flex-1 p-3 bg-slate-800 rounded-lg text-center"
              >
                <div class="text-sm text-slate-300 mb-1">{{ player.playerName }}</div>
                <div class="text-2xl font-bold text-white">
                  {{ match.setsWon?.[player.playerId] || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Match Info -->
        <div class="card bg-slate-900/50">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-white">{{ formatDuration(match.duration) }}</div>
              <div class="text-xs text-slate-400">Duration</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-white">{{ totalRounds }}</div>
              <div class="text-xs text-slate-400">Rounds</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-white">{{ match.turns.length }}</div>
              <div class="text-xs text-slate-400">Total Turns</div>
            </div>
          </div>
        </div>

        <!-- Players Stats -->
        <div class="space-y-3">
          <h3 class="text-lg font-bold text-white">Player Statistics</h3>
          <div
            v-for="player in match.players"
            :key="player.playerId"
            :class="[
              'card',
              player.playerId === match.winnerId
                ? 'bg-slate-800 border-l-4 border-l-dart-gold'
                : 'bg-slate-900'
            ]"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold text-white">{{ player.playerName }}</span>
                <span v-if="player.playerId === match.winnerId" class="text-dart-gold">👑</span>
              </div>
              <div class="text-2xl font-bold text-primary-400">
                {{ player.finalScore }}
              </div>
            </div>

            <div class="grid grid-cols-4 gap-3 text-sm">
              <div>
                <div class="text-white font-medium">{{ player.dartCount }}</div>
                <div class="text-slate-400 text-xs">Darts</div>
              </div>
              <div>
                <div class="text-white font-medium">{{ player.averageScore.toFixed(1) }}</div>
                <div class="text-slate-400 text-xs">Average</div>
              </div>
              <div>
                <div class="text-white font-medium">{{ player.highestTurnScore }}</div>
                <div class="text-slate-400 text-xs">Highest</div>
              </div>
              <div>
                <div class="text-white font-medium">{{ player.successfulCheckouts }}/{{ player.checkoutAttempts }}</div>
                <div class="text-slate-400 text-xs">Checkouts</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Turn History -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">Turn History</h3>
            <button
              @click="showTurnHistory = !showTurnHistory"
              class="text-sm text-primary-400 hover:text-primary-300"
            >
              {{ showTurnHistory ? 'Hide' : 'Show' }}
            </button>
          </div>

          <div v-if="showTurnHistory" class="space-y-2">
            <div
              v-for="turn in match.turns"
              :key="turn.id"
              :class="[
                'card p-3',
                turn.isBust ? 'bg-dart-red/10 border border-dart-red/30' :
                turn.isCheckout ? 'bg-dart-gold/10 border border-dart-gold/30' :
                'bg-slate-900'
              ]"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-sm text-slate-400">
                    <span v-if="showSetsLegs && turn.setNumber && turn.legNumber">S{{ turn.setNumber }} L{{ turn.legNumber }} · </span>Turn {{ turn.turnNumber }}
                  </span>
                  <span class="text-sm font-medium text-white">
                    {{ getPlayerName(turn.playerId) }}
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex gap-1">
                    <span
                      v-for="(dart, index) in turn.darts"
                      :key="index"
                      class="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-white"
                    >
                      {{ dart.segment }}
                    </span>
                  </div>
                  <span :class="[
                    'text-sm font-bold',
                    turn.isBust ? 'text-dart-red' :
                    turn.isCheckout ? 'text-dart-gold' :
                    'text-white'
                  ]">
                    {{ turn.isBust ? 'BUST' : turn.totalScore }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :is-open="showDeleteConfirm"
      title="Delete Match"
      @close="showDeleteConfirm = false"
    >
      <div class="space-y-4">
        <p class="text-slate-300">
          Are you sure you want to delete this match? This action cannot be undone.
        </p>

        <div class="flex gap-3 pt-2">
          <UiButton
            variant="danger"
            @click="handleDeleteMatch"
            full-width
          >
            Delete Match
          </UiButton>
          <UiButton
            variant="ghost"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { Match } from '~/types/match'

const route = useRoute()
const matchId = route.params.id as string

const { getMatch, deleteMatch } = useMatchHistory()
const toast = useToast()

const loading = ref(true)
const match = ref<Match | null>(null)
const showTurnHistory = ref(false)
const showDeleteConfirm = ref(false)

useHead({
  title: () => match.value ? `${match.value.gameMode} Match` : 'Match Details'
})

// Show sets/legs info if match had more than 1 set or leg
const showSetsLegs = computed(() => {
  if (!match.value) return false
  const sets = match.value.totalSets || 1
  const legs = match.value.totalLegs || 1
  return sets > 1 || legs > 1
})

// Load match on mount
onMounted(async () => {
  try {
    match.value = await getMatch(matchId)
    if (!match.value) {
      setTimeout(() => {
        navigateTo('/history')
      }, 2000)
    }
  } catch (error) {
    console.error('Failed to load match:', error)
  } finally {
    loading.value = false
  }
})

// Computed
const winner = computed(() => {
  if (!match.value) return null
  return match.value.players.find(p => p.playerId === match.value!.winnerId)
})

const totalRounds = computed(() => {
  if (!match.value || match.value.players.length === 0) return 0
  // Use the first player's turn count as rounds
  return match.value.players[0].turnCount
})

// Helper functions
const getPlayerName = (playerId: string): string => {
  if (!match.value) return 'Unknown'
  const player = match.value.players.find(p => p.playerId === playerId)
  return player?.playerName || 'Unknown'
}

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) {
    return `${seconds}s`
  }
  return `${minutes}m ${seconds}s`
}

const handleDeleteMatch = async () => {
  try {
    await deleteMatch(matchId)
    toast.success('Match deleted successfully')
    navigateTo('/history')
  } catch (error) {
    console.error('Failed to delete match:', error)
    toast.error('Failed to delete match')
  }
}
</script>
