<template>
  <div class="space-y-6">
    <!-- Filter Toggle -->
    <div class="flex gap-2">
      <button
        v-for="filter in filterOptions"
        :key="filter.value"
        @click="statsFilter = filter.value"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="statsFilter === filter.value
          ? 'bg-primary-500 text-white'
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="inline-block animate-spin text-4xl mb-4">⟳</div>
        <p class="text-slate-400">Loading statistics...</p>
      </div>
    </div>

    <template v-else-if="stats">
      <!-- Main Stats Grid -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Win Rate -->
        <div class="bg-slate-900 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-sm text-slate-400">Win Rate</span>
          </div>
          <div class="text-3xl font-bold text-white">{{ stats.winRate.toFixed(1) }}%</div>
          <div class="text-xs text-slate-500 mt-1">
            {{ stats.gamesWon }} / {{ stats.gamesPlayed }} games
          </div>
        </div>

        <!-- 3-Dart Average -->
        <div class="bg-slate-900 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span class="text-sm">🎯</span>
            </div>
            <span class="text-sm text-slate-400">3-Dart Avg</span>
          </div>
          <div class="text-3xl font-bold text-primary-400">{{ stats.threeDartAverage.toFixed(1) }}</div>
          <div class="text-xs text-slate-500 mt-1">
            Best: {{ stats.bestThreeDartAvg.toFixed(1) }}
          </div>
        </div>

        <!-- First 9 Average -->
        <div class="bg-slate-900 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="text-sm text-slate-400">First 9 Avg</span>
          </div>
          <div class="text-3xl font-bold text-blue-400">{{ stats.firstNineAverage.toFixed(1) }}</div>
          <div class="text-xs text-slate-500 mt-1">
            Opening power
          </div>
        </div>

        <!-- Checkout % -->
        <div class="bg-slate-900 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-full bg-dart-gold/20 flex items-center justify-center">
              <span class="text-sm">🏆</span>
            </div>
            <span class="text-sm text-slate-400">Checkout %</span>
          </div>
          <div class="text-3xl font-bold text-dart-gold">{{ stats.checkoutPercentage.toFixed(1) }}%</div>
          <div class="text-xs text-slate-500 mt-1">
            {{ stats.successfulCheckouts }} / {{ stats.checkoutAttempts }} attempts
          </div>
        </div>
      </div>

      <!-- High Scores Section -->
      <div class="bg-slate-900 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-white mb-4">High Scores</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-red-400">{{ stats.oneEighties }}</div>
            <div class="text-sm text-slate-400">180s</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-400">{{ stats.oneFourtyPlus }}</div>
            <div class="text-sm text-slate-400">140+</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-400">{{ stats.oneHundredPlus }}</div>
            <div class="text-sm text-slate-400">100+</div>
          </div>
        </div>
      </div>

      <!-- Checkout Analysis -->
      <div class="bg-slate-900 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-white mb-4">Checkout Analysis</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Highest Checkout</span>
            <span class="text-xl font-bold text-dart-gold">{{ stats.highestCheckout }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Average Checkout</span>
            <span class="text-lg font-medium text-white">{{ stats.averageCheckout.toFixed(1) }}</span>
          </div>

          <!-- Checkout by Range -->
          <div class="mt-4 pt-4 border-t border-slate-800">
            <div class="text-sm text-slate-500 mb-3">Checkouts by Range</div>
            <div class="space-y-2">
              <PlayerCheckoutRangeBar
                label="2-50"
                :count="stats.checkoutsByRange.under50"
                :total="stats.successfulCheckouts"
                color="bg-green-500"
              />
              <PlayerCheckoutRangeBar
                label="51-80"
                :count="stats.checkoutsByRange.range50to80"
                :total="stats.successfulCheckouts"
                color="bg-blue-500"
              />
              <PlayerCheckoutRangeBar
                label="81-100"
                :count="stats.checkoutsByRange.range81to100"
                :total="stats.successfulCheckouts"
                color="bg-yellow-500"
              />
              <PlayerCheckoutRangeBar
                label="101-130"
                :count="stats.checkoutsByRange.range101to130"
                :total="stats.successfulCheckouts"
                color="bg-orange-500"
              />
              <PlayerCheckoutRangeBar
                label="131-170"
                :count="stats.checkoutsByRange.range131to170"
                :total="stats.successfulCheckouts"
                color="bg-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Bust Statistics -->
      <div class="bg-slate-900 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-white mb-4">Discipline</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-2xl font-bold text-white">{{ stats.totalBusts }}</div>
            <div class="text-sm text-slate-400">Total Busts</div>
          </div>
          <div>
            <div class="text-2xl font-bold" :class="bustRateColor">
              {{ stats.bustPercentage.toFixed(1) }}%
            </div>
            <div class="text-sm text-slate-400">Bust Rate</div>
          </div>
        </div>
      </div>

      <!-- Performance Chart -->
      <PlayerStatsChart
        v-if="stats.matchHistory && stats.matchHistory.length > 1"
        title="3-Dart Average Trend"
        :data="averageChartData"
        :value-formatter="(v) => v.toFixed(1)"
        color="#22c55e"
      />

      <!-- Recent Form -->
      <div v-if="stats.recentForm.length > 0" class="bg-slate-900 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-white mb-3">Recent Form</h3>
        <div class="flex gap-1">
          <div
            v-for="(result, index) in stats.recentForm"
            :key="index"
            class="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
            :class="result === 'W'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'"
          >
            {{ result }}
          </div>
        </div>
        <div class="mt-2 text-xs text-slate-500">
          {{ recentFormSummary }}
        </div>
      </div>

      <!-- Stats by Game Mode -->
      <div v-if="hasGameModeStats" class="bg-slate-900 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-white mb-4">Stats by Game Mode</h3>
        <div class="space-y-4">
          <div
            v-for="(modeStats, mode) in stats.statsByMode"
            :key="mode"
            class="border-b border-slate-800 pb-3 last:border-0 last:pb-0"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xl font-bold text-primary-400">{{ mode }}</span>
              <span class="text-sm text-slate-400">
                {{ modeStats.gamesPlayed }} games
              </span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div>
                <div class="text-sm font-medium text-white">{{ modeStats.winRate.toFixed(0) }}%</div>
                <div class="text-xs text-slate-500">Win Rate</div>
              </div>
              <div>
                <div class="text-sm font-medium text-white">{{ modeStats.threeDartAverage.toFixed(1) }}</div>
                <div class="text-xs text-slate-500">Avg</div>
              </div>
              <div>
                <div class="text-sm font-medium text-white">{{ modeStats.highestCheckout }}</div>
                <div class="text-xs text-slate-500">High CO</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Totals -->
      <div class="bg-slate-900 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-white mb-4">Career Totals</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-2xl font-bold text-white">{{ stats.totalDartsThrown.toLocaleString() }}</div>
            <div class="text-sm text-slate-400">Darts Thrown</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ stats.totalPointsScored.toLocaleString() }}</div>
            <div class="text-sm text-slate-400">Points Scored</div>
          </div>
        </div>
      </div>
    </template>

    <!-- No Stats State -->
    <div v-else class="text-center py-12">
      <div class="text-5xl mb-4">📊</div>
      <h3 class="text-xl font-bold text-white mb-2">No Statistics Yet</h3>
      <p class="text-slate-400">
        Play some games to start building your statistics!
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DetailedPlayerStats, StatsFilter } from '~/composables/useStatistics'

interface Props {
  playerId: string
}

const props = defineProps<Props>()

const { getDetailedPlayerStats } = useStatistics()

const loading = ref(true)
const stats = ref<DetailedPlayerStats | null>(null)
const statsFilter = ref<StatsFilter>('all')

// Filter options
const filterOptions = [
  { value: 'all' as StatsFilter, label: 'Alle' },
  { value: 'matches' as StatsFilter, label: 'Nur Matches' },
  { value: 'training' as StatsFilter, label: 'Nur Training' }
]

// Load stats function
const loadStats = async () => {
  loading.value = true
  try {
    stats.value = await getDetailedPlayerStats(props.playerId, statsFilter.value)
  } catch (error) {
    console.error('Failed to load player stats:', error)
  } finally {
    loading.value = false
  }
}

// Load stats on mount
onMounted(async () => {
  await loadStats()
})

// Watch for player changes
watch(() => props.playerId, async () => {
  await loadStats()
})

// Watch for filter changes
watch(statsFilter, async () => {
  await loadStats()
})

// Computed properties
const bustRateColor = computed(() => {
  if (!stats.value) return 'text-white'
  if (stats.value.bustPercentage < 10) return 'text-green-400'
  if (stats.value.bustPercentage < 20) return 'text-yellow-400'
  return 'text-red-400'
})

const recentFormSummary = computed(() => {
  if (!stats.value?.recentForm.length) return ''
  const wins = stats.value.recentForm.filter(r => r === 'W').length
  const total = stats.value.recentForm.length
  return `${wins} wins in last ${total} games`
})

const hasGameModeStats = computed(() => {
  if (!stats.value?.statsByMode) return false
  return Object.keys(stats.value.statsByMode).length > 0
})

const averageChartData = computed(() => {
  if (!stats.value?.matchHistory) return []
  // Reverse to show chronological order (oldest first)
  return [...stats.value.matchHistory].reverse().map((m, i) => ({
    value: m.threeDartAvg,
    label: `#${i + 1}`,
    date: m.date
  }))
})
</script>
