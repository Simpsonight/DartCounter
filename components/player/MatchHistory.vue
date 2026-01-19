<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="inline-block animate-spin text-4xl mb-4">⟳</div>
        <p class="text-slate-400">Loading matches...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="matches.length === 0" class="text-center py-12">
      <div class="text-5xl mb-4">🎯</div>
      <h3 class="text-xl font-bold text-white mb-2">No Matches Yet</h3>
      <p class="text-slate-400">
        {{ playerName }} hasn't played any matches yet.
      </p>
    </div>

    <!-- Matches List -->
    <div v-else class="space-y-3">
      <div
        v-for="match in matches"
        :key="match.matchId"
        @click="navigateTo(`/history/${match.matchId}`)"
        class="bg-slate-900 rounded-xl p-4 cursor-pointer hover:bg-slate-800 transition-colors"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <span class="text-xl font-bold text-primary-400">{{ match.gameMode }}</span>
            <span
              class="px-2 py-0.5 rounded text-xs font-bold"
              :class="match.won
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'"
            >
              {{ match.won ? 'WIN' : 'LOSS' }}
            </span>
          </div>
          <span class="text-sm text-slate-500">{{ formatDate(match.date) }}</span>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span class="text-slate-400 text-sm">vs </span>
            <span class="text-white font-medium">{{ match.opponent }}</span>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-white">{{ match.threeDartAvg.toFixed(1) }}</div>
            <div class="text-xs text-slate-500">3-Dart Avg</div>
          </div>
        </div>

        <div v-if="match.checkout" class="mt-2 pt-2 border-t border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-dart-gold">🏆</span>
            <span class="text-sm text-slate-400">Checkout:</span>
            <span class="text-sm font-bold text-dart-gold">{{ match.checkout }}</span>
          </div>
        </div>
      </div>

      <!-- Load More (if needed) -->
      <div v-if="hasMore" class="text-center">
        <button
          @click="loadMore"
          class="text-primary-400 hover:text-primary-300 text-sm"
        >
          Load more matches...
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MatchStatPoint } from '~/composables/useStatistics'

interface Props {
  playerId: string
  playerName: string
}

const props = defineProps<Props>()

const { getDetailedPlayerStats } = useStatistics()

const loading = ref(true)
const matches = ref<MatchStatPoint[]>([])
const displayLimit = ref(10)

// Load matches on mount
onMounted(async () => {
  await loadMatches()
})

// Watch for player changes
watch(() => props.playerId, async () => {
  displayLimit.value = 10
  await loadMatches()
})

const loadMatches = async () => {
  loading.value = true
  try {
    const stats = await getDetailedPlayerStats(props.playerId)
    matches.value = stats.matchHistory || []
  } catch (error) {
    console.error('Failed to load matches:', error)
  } finally {
    loading.value = false
  }
}

const hasMore = computed(() => {
  return matches.value.length > displayLimit.value
})

const loadMore = () => {
  displayLimit.value += 10
}

// Format date
const formatDate = (date: Date): string => {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return d.toLocaleDateString()
  }
}
</script>
