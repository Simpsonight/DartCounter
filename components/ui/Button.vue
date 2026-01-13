<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="inline-block animate-spin mr-2">⟳</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const buttonClasses = computed(() => {
  const base = 'btn transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg'

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600 active:bg-slate-800',
    danger: 'bg-dart-red text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 active:bg-slate-700'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-touch',
    lg: 'px-8 py-4 text-lg min-h-touch-lg'
  }

  const width = props.fullWidth ? 'w-full' : ''

  return [base, variants[props.variant], sizes[props.size], width].join(' ')
})
</script>
