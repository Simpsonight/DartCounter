<template>
  <UiModal
    :is-open="isOpen"
    title="Install Dart Counter"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <p class="text-slate-300 text-sm">
        Install this app on your iPhone for the best experience:
      </p>

      <!-- Step 1: Share Button -->
      <div class="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
        <div class="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
          1
        </div>
        <div class="flex-1">
          <p class="text-white font-medium mb-1">Tap the Share button</p>
          <div class="flex items-center gap-2 text-slate-400 text-sm">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
            <span>in Safari's bottom toolbar</span>
          </div>
        </div>
      </div>

      <!-- Step 2: Add to Home Screen -->
      <div class="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
        <div class="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
          2
        </div>
        <div class="flex-1">
          <p class="text-white font-medium mb-1">Select "Add to Home Screen"</p>
          <div class="flex items-center gap-2 text-slate-400 text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>from the menu options</span>
          </div>
        </div>
      </div>

      <!-- Step 3: Confirm -->
      <div class="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
        <div class="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
          3
        </div>
        <div class="flex-1">
          <p class="text-white font-medium mb-1">Tap "Add"</p>
          <p class="text-slate-400 text-sm">The app will appear on your home screen</p>
        </div>
      </div>

      <div class="flex gap-3 pt-2">
        <UiButton
          variant="primary"
          @click="$emit('close')"
          full-width
        >
          Got it
        </UiButton>
        <UiButton
          variant="ghost"
          @click="$emit('dismiss')"
        >
          Don't show again
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
}

defineProps<Props>()

defineEmits<{
  close: []
  dismiss: []
}>()
</script>
