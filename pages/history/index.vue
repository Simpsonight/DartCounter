<template>
  <div class="min-h-screen bg-slate-950 safe-top safe-bottom">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
      <div class="max-w-2xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              @click="navigateTo('/')"
              class="p-2 text-slate-400 hover:text-white transition-colors"
              title="Back to home"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 class="text-xl font-bold text-white">Match History</h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-2xl mx-auto px-4 py-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="inline-block animate-spin text-4xl mb-4">⟳</div>
          <p class="text-slate-400">Loading matches...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="matches.length === 0" class="flex items-center justify-center py-20">
        <div class="card text-center max-w-md">
          <div class="text-6xl mb-4">🎯</div>
          <h2 class="text-2xl font-bold text-white mb-2">No Matches Yet</h2>
          <p class="text-slate-400 mb-6">
            Start playing games to build your match history!
          </p>
          <UiButton variant="primary" @click="navigateTo('/game/new')">
            Start New Game
          </UiButton>
        </div>
      </div>

      <!-- Matches List -->
      <div v-else class="space-y-3">
        <div
          v-for="match in matches"
          :key="match.id"
          @click="navigateTo(`/history/${match.id}`)"
          class="card bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <!-- Left: Game Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-primary-400">{{ match.gameMode }}</span>
                <span class="text-sm text-slate-500">{{ formatDate(match.completedAt) }}</span>
              </div>

              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-slate-400">Winner:</span>
                  <span class="text-sm font-bold text-dart-gold">🏆 {{ match.winnerName }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-slate-500">
                  <span>{{ match.playerNames.join(', ') }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Duration & Arrow -->
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-sm font-medium text-white">{{ formatDuration(match.duration) }}</div>
                <div class="text-xs text-slate-500">Duration</div>
              </div>
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MatchSummary } from '~/types/match'

useHead({
  title: 'Match History'
})

const { getMatchSummaries } = useMatchHistory()

const loading = ref(true)
const matches = ref<MatchSummary[]>([])

// Load matches on mount
onMounted(async () => {
  try {
    matches.value = await getMatchSummaries()
  } catch (error) {
    console.error('Failed to load matches:', error)
  } finally {
    loading.value = false
  }
})

// Format date
const formatDate = (date: Date): string => {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return d.toLocaleDateString()
  }
}

// Format duration
const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) {
    return `${seconds}s`
  }
  return `${minutes}m ${seconds}s`
}
</script>
