<template>
  <div
    class="card hover:border-slate-700 transition-all cursor-pointer group"
    @click="$emit('click')"
  >
    <div class="flex items-center gap-4">
      <!-- Avatar -->
      <PlayerAvatar
        :name="player.name"
        :avatar="player.avatar"
        size="md"
      />

      <!-- Player Info -->
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
          {{ player.name }}
        </h3>
        <div class="flex items-center gap-4 text-sm text-slate-400 mt-1">
          <span v-if="loading" class="animate-pulse">Loading...</span>
          <template v-else>
            <span>{{ stats.gamesPlayed }} games</span>
            <span v-if="stats.gamesWon > 0">
              {{ stats.gamesWon }} wins
            </span>
            <span v-if="stats.threeDartAverage > 0">
              {{ stats.threeDartAverage.toFixed(1) }} avg
            </span>
          </template>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="showActions" class="flex items-center gap-2" @click.stop>
        <button
          class="p-2 text-slate-400 hover:text-primary-400 rounded-lg hover:bg-slate-800 transition-colors"
          @click="$emit('edit')"
          title="Edit player"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          class="p-2 text-slate-400 hover:text-dart-red rounded-lg hover:bg-slate-800 transition-colors"
          @click="$emit('delete')"
          title="Delete player"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <!-- Chevron for navigation -->
      <div v-else class="text-slate-600 group-hover:text-slate-400 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~/types/player'

interface Props {
  player: Player
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false
})

defineEmits<{
  click: []
  edit: []
  delete: []
}>()

const { getDetailedPlayerStats } = useStatistics()

const loading = ref(true)
const stats = ref({
  gamesPlayed: 0,
  gamesWon: 0,
  threeDartAverage: 0
})

// Load real stats from match history
onMounted(async () => {
  try {
    const playerStats = await getDetailedPlayerStats(props.player.id)
    stats.value = {
      gamesPlayed: playerStats.gamesPlayed,
      gamesWon: playerStats.gamesWon,
      threeDartAverage: playerStats.threeDartAverage
    }
  } catch (error) {
    console.error('Failed to load player stats:', error)
    // Fallback to stored stats
    stats.value = {
      gamesPlayed: props.player.stats.gamesPlayed,
      gamesWon: props.player.stats.gamesWon,
      threeDartAverage: props.player.stats.averageScore
    }
  } finally {
    loading.value = false
  }
})
</script>
