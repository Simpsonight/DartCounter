<template>
  <div
    :class="[
      'relative overflow-hidden transition-all duration-300 rounded-lg',
      isActive ? 'bg-slate-800 border-l-4 border-l-primary-500 shadow-lg shadow-primary-500/10' : 'bg-slate-900'
    ]"
  >
    <div class="p-3">
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
        <div class="relative flex gap-2">
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

          <!-- Checkout Indicator - Small star badge -->
          <div v-if="!isActive && isInCheckoutRange(player.remainingScore)" class="absolute -top-2 -right-2">
            <div class="bg-dart-gold rounded-full w-6 h-6 flex items-center justify-center text-slate-950 text-sm font-bold shadow-lg">
              ★
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GamePlayer, GameSettings } from '~/types/game'
import type { Dart } from '~/types/score'

interface Props {
  player: GamePlayer
  isActive: boolean
  currentDarts?: Dart[]
  gameSettings?: GameSettings
}

const props = withDefaults(defineProps<Props>(), {
  currentDarts: () => [],
  gameSettings: () => ({
    doubleIn: false,
    doubleOut: true,
    sets: 1,
    legs: 1
  })
})

const { isInCheckoutRange } = useCheckoutCalculator()

// Calculate the display score (remaining score minus current turn total)
const displayScore = computed(() => {
  // If this is the active player and they have darts in progress, show provisional score
  if (props.isActive && props.currentDarts.length > 0) {
    // Check double-in rule: if player hasn't started, only count darts after first double
    if (props.gameSettings.doubleIn && !props.player.hasStarted) {
      const hasDouble = props.currentDarts.some(dart => dart.multiplier === 2 && dart.totalValue > 0)

      if (!hasDouble) {
        // No double hit yet - no score reduction
        return props.player.remainingScore
      }

      // Player hit a double - count darts from first double onwards
      const firstDoubleIndex = props.currentDarts.findIndex(dart => dart.multiplier === 2 && dart.totalValue > 0)
      const dartsAfterDouble = props.currentDarts.slice(firstDoubleIndex)
      const turnTotal = dartsAfterDouble.reduce((sum, dart) => sum + dart.totalValue, 0)
      return Math.max(0, props.player.remainingScore - turnTotal)
    }

    // Normal calculation (player has already started or no double-in rule)
    const turnTotal = props.currentDarts.reduce((sum, dart) => sum + dart.totalValue, 0)
    return Math.max(0, props.player.remainingScore - turnTotal)
  }
  // Otherwise show the actual remaining score
  return props.player.remainingScore
})
</script>
