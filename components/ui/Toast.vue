<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-4 opacity-0"
  >
    <div
      v-if="isVisible"
      :class="[
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4',
        'px-6 py-4 rounded-lg shadow-2xl',
        'flex items-center gap-3',
        variantClasses
      ]"
    >
      <span class="text-2xl flex-shrink-0">{{ icon }}</span>
      <div class="flex-1 min-w-0">
        <p v-if="title" class="font-bold text-sm mb-0.5">{{ title }}</p>
        <p class="text-sm">{{ message }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  message: string
  title?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  duration: 3000
})

const isVisible = ref(true)

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-dart-green border border-green-500 text-white'
    case 'error':
      return 'bg-dart-red border border-red-500 text-white'
    case 'warning':
      return 'bg-amber-500 border border-amber-600 text-slate-900'
    case 'info':
    default:
      return 'bg-slate-800 border border-slate-700 text-white'
  }
})

const icon = computed(() => {
  switch (props.variant) {
    case 'success':
      return '✓'
    case 'error':
      return '✗'
    case 'warning':
      return '⚠'
    case 'info':
    default:
      return 'ℹ'
  }
})

// Auto-hide after duration
onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      isVisible.value = false
    }, props.duration)
  }
})
</script>
