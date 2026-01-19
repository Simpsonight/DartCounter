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
      <PlayerListItem
        v-for="player in players"
        :key="player.id"
        :player="player"
        :show-actions="showActions"
        @click="handlePlayerClick(player)"
        @edit="emit('edit', player)"
        @delete="emit('delete', player)"
      />
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
