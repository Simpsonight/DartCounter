<template>
  <div class="grid grid-cols-7 gap-1.5">
    <!-- Row 1: 1-7 -->
    <button
      v-for="num in [1, 2, 3, 4, 5, 6, 7]"
      :key="`row1-${num}`"
      @click="emit('select', num)"
      :class="[
        'numpad-btn',
        selectedScore === num ? 'ring-2 ring-primary-500 bg-slate-700' : ''
      ]"
    >
      {{ num }}
    </button>

    <!-- Row 2: 8-14 -->
    <button
      v-for="num in [8, 9, 10, 11, 12, 13, 14]"
      :key="`row2-${num}`"
      @click="emit('select', num)"
      :class="[
        'numpad-btn',
        selectedScore === num ? 'ring-2 ring-primary-500 bg-slate-700' : ''
      ]"
    >
      {{ num }}
    </button>

    <!-- Row 3: 15-20, 25 -->
    <button
      v-for="num in [15, 16, 17, 18, 19, 20]"
      :key="`row3-${num}`"
      @click="emit('select', num)"
      :class="[
        'numpad-btn',
        selectedScore === num ? 'ring-2 ring-primary-500 bg-slate-700' : ''
      ]"
    >
      {{ num }}
    </button>
    <!-- Bull (25) -->
    <button
      @click="emit('select', 25)"
      :class="[
        'numpad-btn bg-dart-gold text-slate-900 hover:bg-yellow-500',
        selectedScore === 25 ? 'ring-2 ring-primary-500' : ''
      ]"
    >
      Bull
    </button>

    <!-- Row 4: 0, Double, Triple, Delete -->
    <button
      @click="emit('select', 0)"
      :class="[
        'numpad-btn',
        selectedScore === 0 ? 'ring-2 ring-primary-500 bg-slate-700' : ''
      ]"
    >
      0
    </button>

    <!-- Double (2 cols wide) -->
    <button
      @click="emit('multiplier', 2)"
      :class="[
        'numpad-btn col-span-2',
        currentMultiplier === 2
          ? 'bg-dart-red text-white ring-2 ring-red-400'
          : 'bg-slate-700 text-white'
      ]"
    >
      Double
    </button>

    <!-- Triple (2 cols wide) -->
    <button
      @click="emit('multiplier', 3)"
      :class="[
        'numpad-btn col-span-2',
        currentMultiplier === 3
          ? 'bg-dart-green text-white ring-2 ring-green-400'
          : 'bg-slate-700 text-white'
      ]"
    >
      Triple
    </button>

    <!-- Delete (2 cols wide) -->
    <button
      @click="emit('delete')"
      :disabled="!canDelete"
      :class="[
        'numpad-btn col-span-2',
        canDelete
          ? 'bg-dart-red text-white hover:bg-red-600'
          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
      ]"
    >
      ⌫ Delete
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedScore?: number
  currentMultiplier?: 1 | 2 | 3
  canDelete?: boolean
}

withDefaults(defineProps<Props>(), {
  currentMultiplier: 1,
  canDelete: false
})

const emit = defineEmits<{
  select: [score: number]
  multiplier: [multiplier: 1 | 2 | 3]
  delete: []
}>()
</script>

<style scoped>
.numpad-btn {
  /* Compact but still touch-friendly (44px min recommended by Apple) */
  min-height: 48px;
  min-width: 44px;

  /* On larger screens, make them bigger */
  @media (min-width: 640px) {
    min-height: 56px;
  }
}
</style>
