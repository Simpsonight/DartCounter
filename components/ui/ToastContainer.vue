<template>
  <Teleport to="body">
    <div class="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-y-4 opacity-0 scale-95"
        enter-to-class="translate-y-0 opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100 scale-100"
        leave-to-class="translate-y-4 opacity-0 scale-95"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'max-w-md w-full pointer-events-auto',
            'px-4 py-3 rounded-lg shadow-2xl',
            'flex items-center gap-3',
            getVariantClasses(toast.variant)
          ]"
          @click="removeToast(toast.id)"
        >
          <span class="text-xl flex-shrink-0">{{ getIcon(toast.variant) }}</span>
          <div class="flex-1 min-w-0">
            <p v-if="toast.title" class="font-bold text-sm mb-0.5">{{ toast.title }}</p>
            <p class="text-sm">{{ toast.message }}</p>
          </div>
          <button
            class="flex-shrink-0 p-1 hover:bg-black/20 rounded transition-colors"
            @click.stop="removeToast(toast.id)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()

const removeToast = (id: string) => {
  remove(id)
}

const getVariantClasses = (variant?: 'success' | 'error' | 'warning' | 'info') => {
  switch (variant) {
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
}

const getIcon = (variant?: 'success' | 'error' | 'warning' | 'info') => {
  switch (variant) {
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
}
</script>
