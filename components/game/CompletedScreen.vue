<template>
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="card text-center max-w-md w-full bg-gradient-to-b from-slate-900 to-slate-950">
      <!-- Trophy Animation -->
      <div class="text-8xl mb-4 animate-bounce">🏆</div>

      <!-- Congratulations -->
      <h2 class="text-4xl font-bold text-dart-gold mb-2">Congratulations!</h2>
      <p class="text-xl text-slate-300 mb-6">{{ winner?.playerName }} Wins!</p>

      <!-- Winner Avatar/Info -->
      <div class="my-6 p-6 bg-gradient-to-r from-dart-gold/20 to-amber-500/20 border border-dart-gold/30 rounded-lg">
        <PlayerAvatar
          v-if="winner"
          :name="winner.playerName"
          :avatar="winner.playerAvatar"
          size="xl"
          class="mx-auto mb-4"
        />

        <!-- Winner Stats -->
        <div class="grid grid-cols-3 gap-4 mt-4">
          <div>
            <div class="text-2xl font-bold text-white">{{ winner?.dartCount }}</div>
            <div class="text-xs text-slate-400">Darts</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ winner?.averageScore.toFixed(1) }}</div>
            <div class="text-xs text-slate-400">Average</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ checkoutScore }}</div>
            <div class="text-xs text-slate-400">Checkout</div>
          </div>
        </div>
      </div>

      <!-- All Players Stats -->
      <div class="my-6 p-4 bg-slate-800/50 rounded-lg">
        <h3 class="text-sm font-bold text-slate-400 mb-3">Final Scores</h3>
        <div class="space-y-2">
          <div
            v-for="(player, index) in players"
            :key="player.playerId"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center gap-2">
              <span class="text-slate-500">#{{ index + 1 }}</span>
              <span :class="player.playerId === winner?.playerId ? 'text-dart-gold font-bold' : 'text-white'">
                {{ player.playerName }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-slate-400">{{ player.remainingScore }} left</span>
              <span class="text-white font-mono">Ø {{ player.averageScore.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <UiButton variant="primary" full-width @click="$emit('new-game')">
          🎯 New Game
        </UiButton>
        <UiButton variant="secondary" full-width @click="$emit('view-history')">
          📊 View Match History
        </UiButton>
        <UiButton variant="ghost" full-width @click="$emit('go-home')">
          🏠 Back to Home
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GamePlayer } from '~/types/game'
import type { Turn } from '~/types/score'

interface Props {
  winner?: GamePlayer | null
  players: GamePlayer[]
  turns: Turn[]
}

const props = defineProps<Props>()

defineEmits<{
  'new-game': []
  'view-history': []
  'go-home': []
}>()

// Get the checkout score (last turn's total score)
const checkoutScore = computed((): number => {
  if (!props.winner) return 0

  // Find the last turn for the winner (which should be the checkout turn)
  const winnerTurns = props.turns.filter(t => t.playerId === props.winner!.playerId)
  const lastTurn = winnerTurns[winnerTurns.length - 1]

  return lastTurn?.totalScore || 0
})
</script>
