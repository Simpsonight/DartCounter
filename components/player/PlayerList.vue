<template>
  <div class="space-y-4">
    <!-- Empty State -->
    <div v-if="players.length === 0" class="card text-center py-12">
      <div class="text-6xl mb-4">🎯</div>
      <h3 class="text-xl font-semibold text-white mb-2">No players yet</h3>
      <p class="text-slate-400 mb-6">Create your first player to start tracking games</p>
      <slot name="empty-action" />
    </div>

    <!-- Player List -->
    <div v-else class="grid gap-3">
      <div
        v-for="player in players"
        :key="player.id"
        class="card hover:border-slate-700 transition-all cursor-pointer group"
        @click="handlePlayerClick(player)"
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
              <span>{{ player.stats.gamesPlayed }} games</span>
              <span v-if="player.stats.gamesWon > 0">
                {{ player.stats.gamesWon }} wins
              </span>
              <span v-if="player.stats.averageScore > 0">
                {{ player.stats.averageScore.toFixed(1) }} avg
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="showActions" class="flex items-center gap-2" @click.stop>
            <button
              class="p-2 text-slate-400 hover:text-primary-400 rounded-lg hover:bg-slate-800 transition-colors"
              @click="emit('edit', player)"
              title="Edit player"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              class="p-2 text-slate-400 hover:text-dart-red rounded-lg hover:bg-slate-800 transition-colors"
              @click="emit('delete', player)"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~/types/player'

interface Props {
  players: Player[]
  showActions?: boolean
}

withDefaults(defineProps<Props>(), {
  showActions: false
})

const emit = defineEmits<{
  playerClick: [player: Player]
  edit: [player: Player]
  delete: [player: Player]
}>()

const handlePlayerClick = (player: Player) => {
  emit('playerClick', player)
}
</script>
