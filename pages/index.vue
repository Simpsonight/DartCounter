<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6">
    <div class="card max-w-md w-full text-center space-y-6">
      <div>
        <h1 class="text-4xl font-bold text-primary-400 mb-2">
          🎯 Dart Counter
        </h1>
        <p class="text-slate-400">
          Professional dart scoring app
        </p>
      </div>

      <!-- PWA Install Indicator -->
      <div
        v-if="isInstalled"
        class="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg"
      >
        <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span class="text-sm text-green-400 font-medium">App Installed</span>
      </div>

      <div class="space-y-3">
        <UiButton variant="primary" full-width @click="navigateTo('/game/new')">
          New Game
        </UiButton>
        <UiButton variant="secondary" full-width @click="navigateTo('/players')">
          Players
        </UiButton>
        <UiButton variant="secondary" full-width @click="navigateTo('/history')">
          Match History
        </UiButton>
        <UiButton variant="ghost" full-width @click="navigateTo('/settings')">
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </span>
        </UiButton>
      </div>

      <!-- Manual Install Button (if installable but not auto-shown) -->
      <div v-if="isInstallable && !showBanner" class="pt-4">
        <button
          @click="handleInstallClick"
          class="text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          Install App
        </button>
      </div>

      <div class="pt-6 border-t border-slate-800">
        <p class="text-sm text-slate-500">
          {{ formattedVersion }} {{ releaseLabel }} — © 2026 Dart Counter
        </p>
      </div>
    </div>

    <!-- Install Prompts -->
    <UiInstallPrompt
      :show="showBanner && !isInstalled"
      @install="handleInstall"
      @dismiss="handleDismiss"
    />

    <UiIOSInstallPrompt
      :is-open="showIOSInstructions && !isInstalled"
      @close="showIOSInstructions = false"
      @dismiss="dismissIOSInstructions"
    />
  </div>
</template>

<script setup lang="ts">
// Lazy load install prompts - they show after delay or on user action
const UiInstallPrompt = defineAsyncComponent(() => import('~/components/ui/InstallPrompt.vue'))
const UiIOSInstallPrompt = defineAsyncComponent(() => import('~/components/ui/IOSInstallPrompt.vue'))

useHead({
  title: 'Home - Dart Counter'
})

const {
  isInstallable,
  isInstalled,
  isIOS,
  showIOSInstructions,
  promptInstall,
  dismissIOSInstructions
} = useInstallPrompt()

const { formattedVersion, releaseLabel } = useVersion()

// Control when to show the banner (don't show immediately on mount)
const showBanner = ref(false)

const toast = useToast()

// Show banner after a delay if installable
onMounted(() => {
  if (isInstallable.value && !isInstalled.value) {
    setTimeout(() => {
      showBanner.value = true
    }, 5000) // Show after 5 seconds
  }
})

const handleInstall = async () => {
  const result = await promptInstall()

  if (result === 'accepted') {
    toast.success('App installed successfully!', 'Success')
    showBanner.value = false
  } else if (result === 'dismissed') {
    toast.info('You can install the app anytime from the menu', 'Maybe later')
    showBanner.value = false
  }
}

const handleInstallClick = async () => {
  await handleInstall()
}

const handleDismiss = () => {
  showBanner.value = false

  // Store dismissal in localStorage to not show again for 7 days
  localStorage.setItem('install-banner-dismissed', Date.now().toString())
}

// Check if banner was recently dismissed
onMounted(() => {
  const dismissed = localStorage.getItem('install-banner-dismissed')
  if (dismissed) {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    if (parseInt(dismissed) > sevenDaysAgo) {
      showBanner.value = false
    }
  }
})
</script>
