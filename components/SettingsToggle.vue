<template>
  <label
    :class="[
      'flex items-center justify-between cursor-pointer',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
  >
    <div class="flex-1 min-w-0 pr-4">
      <div class="text-white font-medium">{{ label }}</div>
      <div class="text-sm text-slate-400">
        {{ disabled && disabledReason ? disabledReason : description }}
      </div>
    </div>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      @click="toggle"
      :class="[
        'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900',
        modelValue ? 'bg-primary-600' : 'bg-slate-700',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      ]"
    >
      <span
        :class="[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          modelValue ? 'translate-x-5' : 'translate-x-0'
        ]"
      />
    </button>
  </label>
</template>

<script setup lang="ts">
interface Props {
  label: string
  description: string
  modelValue: boolean
  disabled?: boolean
  disabledReason?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toggle = () => {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>
