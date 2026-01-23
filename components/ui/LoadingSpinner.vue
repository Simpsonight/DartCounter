<template>
  <div :class="containerClasses">
    <!-- Spinner -->
    <div :class="spinnerClasses">
      <svg
        class="animate-spin"
        :class="iconSizeClasses"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>

    <!-- Text -->
    <p v-if="text" :class="textClasses">
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** Loading text to display */
  text?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to center in full screen */
  fullScreen?: boolean
  /** Whether to show inline (no padding) */
  inline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: undefined,
  size: 'md',
  fullScreen: false,
  inline: false
})

const containerClasses = computed(() => {
  const base = 'flex flex-col items-center justify-center'

  if (props.fullScreen) {
    return `${base} min-h-screen`
  }

  if (props.inline) {
    return `${base} gap-2`
  }

  const padding = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12'
  }

  return `${base} ${padding[props.size]}`
})

const spinnerClasses = computed(() => {
  return 'text-primary-500'
})

const iconSizeClasses = computed(() => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  return sizes[props.size]
})

const textClasses = computed(() => {
  const sizes = {
    sm: 'text-sm mt-2',
    md: 'text-base mt-3',
    lg: 'text-lg mt-4'
  }
  return `text-slate-400 ${sizes[props.size]}`
})
</script>
