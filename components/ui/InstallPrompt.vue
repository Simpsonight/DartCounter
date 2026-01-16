<template>
  <!-- Install Banner (shows at bottom) -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="translate-y-full"
    enter-to-class="translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="translate-y-0"
    leave-to-class="translate-y-full"
  >
    <div
      v-if="show"
      class="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-2xl"
    >
      <div class="max-w-2xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between gap-4">
          <!-- Icon & Text -->
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="flex-shrink-0">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-lg leading-tight">Install Dart Counter</p>
              <p class="text-sm text-primary-100 leading-tight mt-0.5">
                Get the full app experience
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              @click="handleInstall"
              class="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              Install
            </button>
            <button
              @click="handleDismiss"
              class="p-2 hover:bg-primary-600/50 rounded-lg transition-colors"
              title="Maybe later"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  install: []
  dismiss: []
}>()

const handleInstall = () => {
  emit('install')
}

const handleDismiss = () => {
  emit('dismiss')
}
</script>
