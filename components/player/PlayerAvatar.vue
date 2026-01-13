<template>
  <div
    :class="[
      'rounded-full flex items-center justify-center font-bold text-white overflow-hidden',
      sizeClasses,
      avatar ? 'bg-slate-700' : 'bg-gradient-to-br from-primary-600 to-primary-800'
    ]"
  >
    <img
      v-if="avatar"
      :src="avatar"
      :alt="name"
      class="w-full h-full object-cover"
    />
    <span v-else :class="textSizeClasses">
      {{ initials }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  avatar?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const initials = computed(() => {
  const names = props.name.trim().split(' ')
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase()
  }
  return (names[0][0] + names[names.length - 1][0]).toUpperCase()
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }
  return sizes[props.size]
})

const textSizeClasses = computed(() => {
  const sizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl'
  }
  return sizes[props.size]
})
</script>
