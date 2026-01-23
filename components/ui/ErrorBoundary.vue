<template>
  <div>
    <!-- Error Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showErrorModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          @click.self="handleDismiss"
        >
          <div class="bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-700">
            <!-- Header -->
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span class="text-red-500 text-xl">!</span>
              </div>
              <h2 class="text-lg font-semibold text-white">
                Ein Fehler ist aufgetreten
              </h2>
            </div>

            <!-- Error Message -->
            <div class="mb-6">
              <p class="text-slate-300 mb-2">
                {{ currentError?.message || 'Ein unerwarteter Fehler ist aufgetreten.' }}
              </p>
              <p v-if="currentError?.context" class="text-sm text-slate-500">
                Kontext: {{ currentError.context }}
              </p>
            </div>

            <!-- Stack trace (dev only) -->
            <details v-if="isDev && currentError?.stack" class="mb-4">
              <summary class="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                Technische Details
              </summary>
              <pre class="mt-2 p-3 bg-slate-900 rounded text-xs text-slate-400 overflow-x-auto max-h-40">{{ currentError.stack }}</pre>
            </details>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                v-if="currentError?.recoverable"
                class="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                @click="handleDismiss"
              >
                Schliessen
              </button>
              <button
                class="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                @click="handleReload"
              >
                Neu laden
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Slot for child content -->
    <slot />
  </div>
</template>

<script setup lang="ts">
const { currentError, showErrorModal, dismissError, recoverWithReload } = useErrorHandler()

const isDev = import.meta.dev

const handleDismiss = () => {
  if (currentError.value?.recoverable) {
    dismissError()
  }
}

const handleReload = () => {
  recoverWithReload()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
