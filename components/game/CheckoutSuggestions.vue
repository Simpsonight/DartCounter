<template>
  <div v-if="suggestions" class="card bg-gradient-to-r from-dart-gold/20 to-amber-500/20 border-dart-gold/30">
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <svg class="w-8 h-8 text-dart-gold" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>

      <div class="flex-1">
        <h3 class="text-lg font-bold text-dart-gold mb-2">
          Checkout Available: {{ suggestions.score }}
        </h3>

        <!-- Show all combinations -->
        <div class="space-y-2">
          <div
            v-for="(combo, index) in suggestions.combinations"
            :key="index"
            :class="[
              'p-3 rounded-lg',
              index === 0 ? 'bg-slate-900/80' : 'bg-slate-900/40'
            ]"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span v-if="index === 0" class="text-xs bg-dart-gold text-slate-900 px-2 py-0.5 rounded-full font-bold">
                  Recommended
                </span>
                <span :class="[
                  'text-xs px-2 py-0.5 rounded-full',
                  combo.difficulty === 'easy' ? 'bg-dart-green/20 text-dart-green' :
                  combo.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-dart-red/20 text-dart-red'
                ]">
                  {{ combo.difficulty }}
                </span>
              </div>
              <div class="text-xs text-slate-400">
                {{ combo.darts.length }} dart{{ combo.darts.length > 1 ? 's' : '' }}
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <span
                v-for="(dart, dartIndex) in combo.darts"
                :key="dartIndex"
                class="text-lg font-bold text-white bg-slate-800 px-3 py-1 rounded"
              >
                {{ dart }}
              </span>
            </div>

            <p class="text-sm text-slate-300 mt-2">{{ combo.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckoutSuggestion } from '~/types/score'

interface Props {
  remainingScore: number
}

const props = defineProps<Props>()

const { getCheckoutSuggestions } = useCheckoutCalculator()

const suggestions = computed(() => {
  return getCheckoutSuggestions(props.remainingScore)
})
</script>
