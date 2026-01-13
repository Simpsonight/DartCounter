<template>
  <div class="grid grid-cols-4 gap-2">
    <!-- Numbers 1-20 + 0 -->
    <button
      v-for="num in numbers"
      :key="num"
      @click="emit('select', num)"
      :class="[
        'numpad-btn',
        num === 0 ? 'col-span-2' : '',
        selectedScore === num ? 'ring-2 ring-primary-500 bg-slate-700' : ''
      ]"
    >
      {{ num }}
    </button>

    <!-- Bull (25) -->
    <button
      @click="emit('select', 25)"
      :class="[
        'numpad-btn col-span-2 bg-dart-gold text-slate-900 hover:bg-yellow-500',
        selectedScore === 25 ? 'ring-2 ring-primary-500' : ''
      ]"
    >
      Bull
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedScore?: number
}

defineProps<Props>()

const emit = defineEmits<{
  select: [score: number]
}>()

// Numbers 1-20 in dartboard order, then 0
const numbers = [
  20, 1, 18, 4,
  13, 6, 10, 15,
  2, 17, 3, 19,
  7, 16, 8, 11,
  14, 9, 12, 5,
  0
]
</script>

<style scoped>
.numpad-btn {
  /* Ensures optimal mobile touch target size */
  min-height: 56px;
  min-width: 56px;

  /* On larger screens, make them bigger */
  @media (min-width: 640px) {
    min-height: 64px;
  }
}
</style>
