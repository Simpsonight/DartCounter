<template>
  <div class="flex items-center gap-3">
    <span class="text-xs text-slate-500 w-16">{{ label }}</span>
    <div class="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="color"
        :style="{ width: `${percentage}%` }"
      />
    </div>
    <span class="text-xs font-medium text-white w-8 text-right">{{ count }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  count: number
  total: number
  color: string
}

const props = defineProps<Props>()

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.min(100, (props.count / props.total) * 100)
})
</script>
