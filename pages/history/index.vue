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
          <!-- Filter Toggle Button -->
          <button
            @click="showFilters = !showFilters"
            class="p-2 text-slate-400 hover:text-white transition-colors relative"
            :class="{ 'text-primary-400': hasActiveFilters }"
            title="Toggle filters"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <!-- Active filter indicator -->
            <span
              v-if="hasActiveFilters"
              class="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Filter Panel -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="showFilters" class="bg-slate-900 border-b border-slate-800">
        <div class="max-w-2xl mx-auto px-4 py-4 space-y-4">
          <!-- Type Filter (Matches/Training) -->
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2">Typ</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="type in typeFilterOptions"
                :key="type.value"
                @click="selectedType = type.value"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                :class="selectedType === type.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Game Mode Filter -->
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2">Game Mode</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="mode in gameModeOptions"
                :key="mode.value"
                @click="selectedGameMode = mode.value"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                :class="selectedGameMode === mode.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'"
              >
                {{ mode.label }}
              </button>
            </div>
          </div>

          <!-- Player Filter -->
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2">Player</label>
            <select
              v-model="selectedPlayerId"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Players</option>
              <option v-for="player in players" :key="player.id" :value="player.id">
                {{ player.name }}
              </option>
            </select>
          </div>

          <!-- Date Range Filter -->
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2">Time Period</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="period in dateRangeOptions"
                :key="period.value"
                @click="selectedDateRange = period.value"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                :class="selectedDateRange === period.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'"
              >
                {{ period.label }}
              </button>
            </div>
          </div>

          <!-- Clear Filters -->
          <div v-if="hasActiveFilters" class="flex justify-end">
            <button
              @click="clearFilters"
              class="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Content -->
    <div class="max-w-2xl mx-auto px-4 py-4">
      <!-- Stats Summary -->
      <div v-if="!loading && allMatches.length > 0" class="mb-4 grid grid-cols-3 gap-3">
        <div class="bg-slate-900 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-white">{{ filteredMatches.length }}</div>
          <div class="text-xs text-slate-500">{{ filteredMatches.length === allMatches.length ? 'Total' : 'Filtered' }} Matches</div>
        </div>
        <div class="bg-slate-900 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-primary-400">{{ uniquePlayersCount }}</div>
          <div class="text-xs text-slate-500">Players</div>
        </div>
        <div class="bg-slate-900 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-dart-gold">{{ totalPlayTime }}</div>
          <div class="text-xs text-slate-500">Play Time</div>
        </div>
      </div>

      <!-- Loading State -->
      <UiLoadingSpinner v-if="loading" text="Loading matches..." size="lg" />

      <!-- Empty State (no matches at all) -->
      <div v-else-if="allMatches.length === 0" class="flex items-center justify-center py-20">
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

      <!-- No Filter Results -->
      <div v-else-if="filteredMatches.length === 0" class="flex items-center justify-center py-16">
        <div class="card text-center max-w-md">
          <div class="text-5xl mb-4">🔍</div>
          <h2 class="text-xl font-bold text-white mb-2">No Matches Found</h2>
          <p class="text-slate-400 mb-4">
            No matches match your current filters.
          </p>
          <button
            @click="clearFilters"
            class="text-primary-400 hover:text-primary-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      </div>

      <!-- Matches List -->
      <div v-else class="space-y-3">
        <div
          v-for="match in filteredMatches"
          :key="match.id"
          @click="navigateTo(`/history/${match.id}`)"
          class="card bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <!-- Left: Game Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-primary-400">{{ match.gameMode }}</span>
                <span v-if="match.isTraining" class="px-2 py-0.5 rounded text-xs font-medium bg-primary-500/20 text-primary-400">
                  🎯 Training
                </span>
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
import type { GameMode } from '~/types/game'

useHead({
  title: 'Match History'
})

const { getMatchSummaries } = useMatchHistory()
const playersStore = usePlayersStore()

const loading = ref(true)
const allMatches = ref<MatchSummary[]>([])
const showFilters = ref(false)

// Filter state
const selectedType = ref<'all' | 'matches' | 'training'>('all')
const selectedGameMode = ref<GameMode | ''>('')
const selectedPlayerId = ref('')
const selectedDateRange = ref<'all' | 'today' | 'week' | 'month' | 'year'>('all')

// Filter options
const typeFilterOptions = [
  { value: 'all', label: 'Alle' },
  { value: 'matches', label: 'Matches' },
  { value: 'training', label: 'Training' }
] as const

const gameModeOptions = [
  { value: '', label: 'All' },
  { value: '301', label: '301' },
  { value: '501', label: '501' },
  { value: '701', label: '701' }
] as const

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
] as const

// Get players for filter dropdown
const players = computed(() => playersStore.players)

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return selectedType.value !== 'all' ||
    selectedGameMode.value !== '' ||
    selectedPlayerId.value !== '' ||
    selectedDateRange.value !== 'all'
})

// Get date range boundaries
const getDateRangeBoundary = (range: typeof selectedDateRange.value): Date | null => {
  const now = new Date()

  switch (range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'week':
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return weekAgo
    case 'month':
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return monthAgo
    case 'year':
      const yearAgo = new Date(now)
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      return yearAgo
    default:
      return null
  }
}

// Filtered matches
const filteredMatches = computed(() => {
  let filtered = [...allMatches.value]

  // Filter by type (matches/training)
  if (selectedType.value === 'matches') {
    filtered = filtered.filter(m => !m.isTraining)
  } else if (selectedType.value === 'training') {
    filtered = filtered.filter(m => m.isTraining)
  }

  // Filter by game mode
  if (selectedGameMode.value) {
    filtered = filtered.filter(m => m.gameMode === selectedGameMode.value)
  }

  // Filter by player
  if (selectedPlayerId.value) {
    filtered = filtered.filter(m => {
      // Check if player name matches - we need to look up the player
      const player = players.value.find(p => p.id === selectedPlayerId.value)
      if (!player) return false
      return m.playerNames.includes(player.name)
    })
  }

  // Filter by date range
  const startDate = getDateRangeBoundary(selectedDateRange.value)
  if (startDate) {
    filtered = filtered.filter(m => new Date(m.completedAt) >= startDate)
  }

  return filtered
})

// Computed stats
const uniquePlayersCount = computed(() => {
  const playerSet = new Set<string>()
  filteredMatches.value.forEach(m => {
    m.playerNames.forEach(name => playerSet.add(name))
  })
  return playerSet.size
})

const totalPlayTime = computed(() => {
  const totalMs = filteredMatches.value.reduce((sum, m) => sum + m.duration, 0)
  const totalMinutes = Math.floor(totalMs / 60000)

  if (totalMinutes < 60) {
    return `${totalMinutes}m`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours < 24) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
})

// Clear all filters
const clearFilters = () => {
  selectedType.value = 'all'
  selectedGameMode.value = ''
  selectedPlayerId.value = ''
  selectedDateRange.value = 'all'
}

// Load matches on mount
onMounted(async () => {
  try {
    // Load players for filter dropdown
    await playersStore.loadPlayers()
    // Load all matches (including training sessions)
    allMatches.value = await getMatchSummaries()
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
