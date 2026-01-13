<template>
  <div class="space-y-4">
    <!-- Error Message -->
    <div v-if="errorMessage" class="p-3 bg-dart-red/20 border border-dart-red/50 rounded-lg">
      <p class="text-sm text-dart-red">{{ errorMessage }}</p>
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

interface Props {
  remainingScore: number
  canDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canDelete: false
})

const emit = defineEmits<{
  dartThrown: [dart: Dart]
  turnComplete: [darts: Dart[]]
  delete: []
}>()

const { calculateDartValue, getDartSegment } = useScoreValidation()

// State
const currentDarts = ref<Dart[]>([])
const currentMultiplier = ref<1 | 2 | 3>(1)
const pendingScore = ref<number | null>(null)
const errorMessage = ref<string | null>(null)

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
    errorMessage.value = 'Maximum 3 darts per turn'
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
  errorMessage.value = null

  // Emit dart thrown event (for live update in player card)
  emit('dartThrown', dart)

  // Reset multiplier to single after each dart
  currentMultiplier.value = 1

  // Auto-submit after 3 darts
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
    errorMessage.value = null
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to submit turn'
  }
}

// Watch for changes in remaining score to show warnings
watch(turnTotal, (total) => {
  if (total > props.remainingScore) {
    errorMessage.value = `Turn total (${total}) exceeds remaining score (${props.remainingScore})`
  } else if (props.remainingScore - total === 1) {
    errorMessage.value = 'Warning: Score of 1 is impossible to finish'
  } else {
    errorMessage.value = null
  }
})

// Expose currentDarts for parent component
defineExpose({
  currentDarts
})
</script>
