<template>
  <div
    :class="[
      'relative overflow-hidden transition-all duration-300',
      isActive ? 'bg-slate-800 border-l-4 border-l-primary-500' : 'bg-slate-900'
    ]"
  >
    <div class="p-4">
      <div class="flex items-center justify-between">
        <!-- Left: Score & Name -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-3">
            <div :class="[
              'text-5xl font-bold tabular-nums',
              isActive ? 'text-primary-400' : 'text-white'
            ]">
              {{ displayScore }}
            </div>
            <div class="text-lg text-slate-400">
              {{ player.playerName }}
            </div>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 mt-2 text-sm text-slate-500">
            <span>Ø {{ player.averageScore.toFixed(1) }}</span>
            <span>•</span>
            <span>{{ player.dartCount }} darts</span>
          </div>
        </div>

        <!-- Right: Current Darts (always show 3 slots for all players) -->
        <div class="flex gap-2">
          <div
            v-for="index in 3"
            :key="index"
            :class="[
              'flex flex-col items-center justify-center rounded px-3 py-2 min-w-[48px]',
              currentDarts[index - 1]
                ? 'bg-slate-950'
                : 'bg-slate-800/50 border border-slate-700'
            ]"
          >
            <template v-if="currentDarts[index - 1]">
              <div class="text-lg font-bold text-white">{{ currentDarts[index - 1].segment }}</div>
              <div class="text-xs text-slate-400">{{ currentDarts[index - 1].totalValue }}</div>
            </template>
            <template v-else>
              <div class="text-lg text-slate-600">-</div>
            </template>
          </div>
        </div>

        <!-- Checkout Indicator (overlay on darts) -->
        <div v-if="!isActive && isInCheckoutRange(player.remainingScore)" class="absolute right-4 top-1/2 -translate-y-1/2">
          <div class="text-dart-gold text-2xl">★</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GamePlayer } from '~/types/game'
import type { Dart } from '~/types/score'

interface Props {
  player: GamePlayer
  isActive: boolean
  currentDarts?: Dart[]
}

const props = withDefaults(defineProps<Props>(), {
  currentDarts: () => []
})

const { isInCheckoutRange } = useCheckoutCalculator()

// Calculate the display score (remaining score minus current turn total)
const displayScore = computed(() => {
  // If this is the active player and they have darts in progress, show provisional score
  if (props.isActive && props.currentDarts.length > 0) {
    const turnTotal = props.currentDarts.reduce((sum, dart) => sum + dart.totalValue, 0)
    return Math.max(0, props.player.remainingScore - turnTotal)
  }
  // Otherwise show the actual remaining score
  return props.player.remainingScore
})
</script>
