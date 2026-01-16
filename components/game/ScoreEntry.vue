<template>
  <div class="space-y-2">
    <!-- Bust Warning (compact) -->
    <div v-if="bustWarning" class="px-3 py-2 bg-dart-red/20 border border-dart-red/50 rounded-lg animate-pulse">
      <div class="flex items-center gap-2">
        <span class="text-xl">⚠️</span>
        <div>
          <span class="text-sm font-bold text-dart-red">{{ bustWarning.title }}</span>
          <span class="text-xs text-dart-red/80 ml-2">{{ bustWarning.message }}</span>
        </div>
      </div>
    </div>

    <!-- Warning Message (non-bust, compact) -->
    <div v-else-if="warningMessage" class="px-3 py-2 bg-amber-500/20 border border-amber-500/50 rounded-lg">
      <p class="text-sm text-amber-400">{{ warningMessage }}</p>
    </div>

    <!-- Numpad with integrated controls -->
    <UiNumpad
      :selected-score="pendingScore"
      :current-multiplier="currentMultiplier"
      :can-delete="canDelete"
      @select="handleScoreSelect"
      @multiplier="handleMultiplierChange"
      @delete="emit('delete')"
    />
  </div>
</template>

<script setup lang="ts">
import type { Dart } from '~/types/score'
import type { GameSettings } from '~/types/game'

interface Props {
  remainingScore: number
  canDelete?: boolean
  gameSettings?: GameSettings
  hasStarted?: boolean  // For double-in rule
}

const props = withDefaults(defineProps<Props>(), {
  canDelete: false,
  hasStarted: true,
  gameSettings: () => ({
    doubleIn: false,
    doubleOut: true,
    sets: 1,
    legs: 1
  })
})

const emit = defineEmits<{
  dartThrown: [dart: Dart]
  turnComplete: [darts: Dart[]]
  delete: []
}>()

const { calculateDartValue, getDartSegment, isBust: checkBust, isImpossibleCheckout } = useScoreValidation()

// State
const currentDarts = ref<Dart[]>([])
const currentMultiplier = ref<1 | 2 | 3>(1)
const pendingScore = ref<number | null>(null)
const warningMessage = ref<string | null>(null)
const bustWarning = ref<{ title: string, message: string } | null>(null)

// Computed
const turnTotal = computed(() => {
  return currentDarts.value.reduce((sum, dart) => sum + dart.totalValue, 0)
})

// Handle multiplier change from numpad
const handleMultiplierChange = (multiplier: 1 | 2 | 3) => {
  currentMultiplier.value = multiplier
}

// Handle score selection from numpad
const handleScoreSelect = (score: number) => {
  if (currentDarts.value.length >= 3) {
    warningMessage.value = 'Maximum 3 darts per turn'
    return
  }

  const totalValue = calculateDartValue(score, currentMultiplier.value)
  const segment = getDartSegment(score, currentMultiplier.value)

  const dart: Dart = {
    score,
    multiplier: currentMultiplier.value,
    totalValue,
    segment
  }

  currentDarts.value.push(dart)
  pendingScore.value = null

  // Emit dart thrown event (for live update in player card)
  emit('dartThrown', dart)

  // Reset multiplier to single after each dart
  currentMultiplier.value = 1

  // Check if this dart results in a checkout or bust
  const turnTotal = currentDarts.value.reduce((sum, d) => sum + d.totalValue, 0)
  const remainingAfter = props.remainingScore - turnTotal

  // Check for valid checkout
  if (remainingAfter === 0) {
    // Check if it's a valid checkout (double out rule)
    const lastDart = currentDarts.value[currentDarts.value.length - 1]
    const isValidCheckout = !props.gameSettings.doubleOut || lastDart.multiplier === 2

    if (isValidCheckout) {
      // Valid checkout - submit immediately
      setTimeout(() => {
        submitTurn()
      }, 300)
      return
    } else {
      // Invalid checkout (not a double) - this is a bust, submit immediately
      setTimeout(() => {
        submitTurn()
      }, 300)
      return
    }
  }

  // Check for double-in bust (player hasn't started and hasn't hit a double yet)
  if (props.gameSettings.doubleIn && !props.hasStarted && currentDarts.value.length === 3) {
    const hasDouble = currentDarts.value.some(dart => dart.multiplier === 2 && dart.totalValue > 0)
    if (!hasDouble) {
      // Double-in bust - submit immediately after 3 darts
      setTimeout(() => {
        submitTurn()
      }, 300)
      return
    }
  }

  // Check for bust conditions
  // - Score below 0: always bust
  // - Score = 1: only bust if doubleOut is enabled (can't finish on D0.5)
  if (remainingAfter < 0 || (remainingAfter === 1 && props.gameSettings.doubleOut)) {
    // Bust - submit immediately (no need to throw remaining darts)
    setTimeout(() => {
      submitTurn()
    }, 300)
    return
  }

  // Auto-submit after 3 darts (if not already submitted due to checkout or bust)
  if (currentDarts.value.length === 3) {
    setTimeout(() => {
      submitTurn()
    }, 300) // Small delay for visual feedback
  }
}


// Submit the turn (automatically called after 3 darts or manually)
const submitTurn = () => {
  if (currentDarts.value.length === 0) {
    return
  }

  try {
    emit('turnComplete', [...currentDarts.value])
    // Clear after successful emit
    currentDarts.value = []
    currentMultiplier.value = 1
    pendingScore.value = null
    bustWarning.value = null
    warningMessage.value = null
  } catch (error) {
    warningMessage.value = error instanceof Error ? error.message : 'Failed to submit turn'
  }
}

// Watch for changes to detect bust conditions
watch(currentDarts, (darts) => {
  if (darts.length === 0) {
    bustWarning.value = null
    warningMessage.value = null
    return
  }

  const total = darts.reduce((sum, dart) => sum + dart.totalValue, 0)
  const remainingAfter = props.remainingScore - total

  // Check for double-in requirement
  if (props.gameSettings.doubleIn && !props.hasStarted) {
    const hasDouble = darts.some(dart => dart.multiplier === 2 && dart.totalValue > 0)

    if (!hasDouble) {
      bustWarning.value = {
        title: 'DOUBLE IN!',
        message: 'Must hit a double to start scoring.'
      }
      return
    } else {
      // Player hit a double, show success message
      warningMessage.value = '✓ Double hit! Scoring started.'
      bustWarning.value = null
      return
    }
  }

  // Check for bust
  const isBustCondition = checkBust(darts, props.remainingScore, props.gameSettings)

  if (isBustCondition) {
    if (remainingAfter < 0) {
      bustWarning.value = {
        title: 'BUST!',
        message: `Score would be ${remainingAfter} (below 0). Turn will be void.`
      }
    } else if (remainingAfter === 1 && props.gameSettings.doubleOut) {
      bustWarning.value = {
        title: 'BUST!',
        message: 'Score of 1 is impossible to finish with double out. Turn will be void.'
      }
    } else if (remainingAfter === 0 && props.gameSettings.doubleOut) {
      const lastDart = darts[darts.length - 1]
      if (lastDart.multiplier !== 2) {
        bustWarning.value = {
          title: 'BUST!',
          message: 'Must finish on a double! Turn will be void.'
        }
      }
    }
    warningMessage.value = null
  } else {
    bustWarning.value = null

    // Check for impossible checkout scores (169, 168, 166, 165, 163, 162, 159)
    if (props.gameSettings.doubleOut && isImpossibleCheckout(remainingAfter)) {
      warningMessage.value = `⚠️ ${remainingAfter} is impossible to checkout! Avoid this score.`
    }
    // Show checkout warning
    else if (remainingAfter === 0) {
      warningMessage.value = '🎯 CHECKOUT! Game will end after this turn.'
    } else {
      warningMessage.value = null
    }
  }
}, { deep: true })

// Expose currentDarts for parent component
defineExpose({
  currentDarts
})
</script>
