<template>
  <div class="space-y-4">
    <!-- Current Dart Entry Display -->
    <div class="card bg-slate-900/80 backdrop-blur">
      <div class="text-center mb-4">
        <div class="text-sm text-slate-400 mb-2">Current Turn</div>
        <div class="flex justify-center items-center gap-3">
          <div
            v-for="(dart, index) in currentDarts"
            :key="index"
            class="flex flex-col items-center"
          >
            <div class="text-2xl font-bold text-white">
              {{ dart.segment }}
            </div>
            <div class="text-sm text-slate-400">{{ dart.totalValue }}</div>
          </div>
          <div
            v-for="index in (3 - currentDarts.length)"
            :key="`empty-${index}`"
            class="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600"
          >
            -
          </div>
        </div>
        <div v-if="currentDarts.length > 0" class="mt-3 text-3xl font-bold text-primary-400">
          Total: {{ turnTotal }}
        </div>
      </div>

      <!-- Multiplier Selection -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <button
          @click="currentMultiplier = 1"
          :class="[
            'numpad-btn',
            currentMultiplier === 1
              ? 'bg-primary-600 text-white ring-2 ring-primary-400'
              : 'bg-slate-700 text-white'
          ]"
        >
          Single
        </button>
        <button
          @click="currentMultiplier = 2"
          :class="[
            'numpad-btn',
            currentMultiplier === 2
              ? 'bg-dart-red text-white ring-2 ring-red-400'
              : 'bg-slate-700 text-white'
          ]"
        >
          Double
        </button>
        <button
          @click="currentMultiplier = 3"
          :class="[
            'numpad-btn',
            currentMultiplier === 3
              ? 'bg-dart-green text-white ring-2 ring-green-400'
              : 'bg-slate-700 text-white'
          ]"
        >
          Triple
        </button>
      </div>

      <!-- Numpad -->
      <UiNumpad
        :selected-score="pendingScore"
        @select="handleScoreSelect"
      />

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-3 mt-4">
        <UiButton
          variant="ghost"
          @click="clearCurrentDart"
          :disabled="currentDarts.length === 0"
        >
          Clear Dart
        </UiButton>
        <UiButton
          variant="primary"
          @click="submitTurn"
          :disabled="currentDarts.length === 0 || submitting"
          :loading="submitting"
        >
          Submit Turn
        </UiButton>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mt-3 p-3 bg-dart-red/20 border border-dart-red/50 rounded-lg">
        <p class="text-sm text-dart-red">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Undo Button -->
    <UiButton
      v-if="canUndo"
      variant="secondary"
      full-width
      @click="emit('undo')"
    >
      ↶ Undo Last Turn
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import type { Dart } from '~/types/score'

interface Props {
  remainingScore: number
  canUndo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canUndo: false
})

const emit = defineEmits<{
  submit: [darts: Dart[]]
  undo: []
}>()

const { calculateDartValue, getDartSegment } = useScoreValidation()

// State
const currentDarts = ref<Dart[]>([])
const currentMultiplier = ref<1 | 2 | 3>(1)
const pendingScore = ref<number | null>(null)
const errorMessage = ref<string | null>(null)
const submitting = ref(false)

// Computed
const turnTotal = computed(() => {
  return currentDarts.value.reduce((sum, dart) => sum + dart.totalValue, 0)
})

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

  // Reset multiplier to single after each dart
  currentMultiplier.value = 1
}

// Clear last dart
const clearCurrentDart = () => {
  if (currentDarts.value.length > 0) {
    currentDarts.value.pop()
    errorMessage.value = null
  }
}

// Submit the turn
const submitTurn = () => {
  if (currentDarts.value.length === 0) {
    return
  }

  submitting.value = true
  errorMessage.value = null

  try {
    emit('submit', [...currentDarts.value])
    // Clear after successful submit
    currentDarts.value = []
    currentMultiplier.value = 1
    pendingScore.value = null
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to submit turn'
  } finally {
    submitting.value = false
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
</script>
