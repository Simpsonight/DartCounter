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

      <!-- Checkout indicator -->
      <div v-if="isInCheckoutRange(player.remainingScore)" class="mt-3 pt-3 border-t border-slate-800">
        <div class="flex items-center gap-2 text-dart-gold">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span class="text-sm font-medium">Checkout available!</span>
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

const { isInCheckoutRange } = useCheckoutCalculator()

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
