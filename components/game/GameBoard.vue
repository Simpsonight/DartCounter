<template>
  <div class="space-y-3">
    <!-- Player Cards -->
    <div
      v-for="(player, index) in players"
      :key="player.playerId"
      :class="[
        'card transition-all duration-300',
        isCurrentPlayer(index) ? 'player-active scale-105' : 'opacity-75'
      ]"
    >
      <div class="flex items-center gap-4">
        <!-- Avatar -->
        <PlayerAvatar
          :name="player.playerName"
          :avatar="player.playerAvatar"
          :size="isCurrentPlayer(index) ? 'lg' : 'md'"
        />

        <!-- Player Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-semibold text-white truncate">
              {{ player.playerName }}
            </h3>
            <span v-if="isCurrentPlayer(index)" class="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">
              Current
            </span>
          </div>
          <div class="flex items-center gap-3 mt-1 text-sm text-slate-400">
            <span>Avg: {{ player.averageScore.toFixed(1) }}</span>
            <span>•</span>
            <span>Darts: {{ player.dartCount }}</span>
          </div>
        </div>

        <!-- Remaining Score -->
        <div class="text-right">
          <div :class="[
            'text-4xl font-bold tabular-nums',
            isCurrentPlayer(index) ? 'text-primary-400' : 'text-white'
          ]">
            {{ player.remainingScore }}
          </div>
          <div class="text-xs text-slate-400 mt-1">
            {{ player.turnCount }} turns
          </div>
        </div>
      </div>
    </div>

    <!-- Game Stats Summary -->
    <div class="card bg-slate-900/50">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-white">{{ gameMode }}</div>
          <div class="text-xs text-slate-400">Mode</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-white">{{ totalTurns }}</div>
          <div class="text-xs text-slate-400">Total Turns</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-white">{{ totalDarts }}</div>
          <div class="text-xs text-slate-400">Total Darts</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GamePlayer, GameMode } from '~/types/game'

interface Props {
  players: GamePlayer[]
  currentPlayerIndex: number
  gameMode: GameMode
}

const props = defineProps<Props>()

// Check if player is current
const isCurrentPlayer = (index: number): boolean => {
  return index === props.currentPlayerIndex
}

// Calculate total stats
const totalTurns = computed(() => {
  return props.players.reduce((sum, p) => sum + p.turnCount, 0)
})

const totalDarts = computed(() => {
  return props.players.reduce((sum, p) => sum + p.dartCount, 0)
})
</script>
