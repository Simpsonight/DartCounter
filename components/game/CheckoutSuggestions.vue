<template>
  <div v-if="suggestions" class="bg-dart-gold/10 border-t border-dart-gold/30 px-4 py-2">
    <div class="flex items-center justify-between gap-3">
      <span class="text-xs font-medium text-dart-gold">Checkout {{ suggestions.score }}:</span>
      <div class="flex items-center gap-1.5">
        <span
          v-for="(dart, index) in suggestions.combinations[0].darts"
          :key="index"
          class="text-sm font-bold text-white bg-slate-800 px-2 py-0.5 rounded"
        >
          {{ dart }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckoutSuggestion } from '~/types/score'

interface Props {
  remainingScore: number
  dartsThrown?: number
}

const props = withDefaults(defineProps<Props>(), {
  dartsThrown: 0
})

const { getCheckoutSuggestions } = useCheckoutCalculator()

const suggestions = computed(() => {
  const dartsRemaining = 3 - props.dartsThrown

  // If no darts remaining, don't show any suggestions
  if (dartsRemaining <= 0) {
    return null
  }

  const allSuggestions = getCheckoutSuggestions(props.remainingScore)

  // If no suggestions at all, return null
  if (!allSuggestions) {
    return null
  }

  // Filter suggestions to only show combinations that use dartsRemaining or fewer darts
  const validCombinations = allSuggestions.combinations.filter(
    combo => combo.darts.length <= dartsRemaining
  )

  // If no valid combinations exist with remaining darts, return null
  if (validCombinations.length === 0) {
    return null
  }

  // Return the suggestions with only valid combinations
  return {
    ...allSuggestions,
    combinations: validCombinations
  }
})
</script>
