<template>
  <div class="flex-shrink-0 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 z-10">
    <div class="max-w-2xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-white">
          {{ title }}
        </h1>
        <button
          @click="$emit('exit')"
          class="p-2 text-slate-400 hover:text-dart-red transition-colors"
          title="Exit game"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()

defineEmits<{
  exit: []
}>()
</script>
