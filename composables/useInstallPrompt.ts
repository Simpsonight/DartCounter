export const useInstallPrompt = () => {
  const deferredPrompt = ref<any>(null)
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const isIOS = ref(false)
  const showIOSInstructions = ref(false)

  // Check if running as PWA
  const checkIfInstalled = () => {
    if (process.client) {
      // Check if running in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://')

      isInstalled.value = isStandalone

      // Check if iOS
      isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    }
  }

  // Listen for beforeinstallprompt event (Chrome, Edge, Samsung Browser)
  const setupInstallPrompt = () => {
    if (process.client) {
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault()
        // Stash the event so it can be triggered later
        deferredPrompt.value = e
        isInstallable.value = true
      })

      // Listen for successful app installation
      window.addEventListener('appinstalled', () => {
        deferredPrompt.value = null
        isInstallable.value = false
        isInstalled.value = true
      })
    }
  }

  // Show the install prompt
  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    if (!deferredPrompt.value) {
      // If iOS, show instructions modal
      if (isIOS.value && !isInstalled.value) {
        showIOSInstructions.value = true
        return 'unsupported'
      }
      return 'unsupported'
    }

    // Show the install prompt
    deferredPrompt.value.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.value.userChoice

    // Clear the deferred prompt
    deferredPrompt.value = null
    isInstallable.value = false

    return outcome === 'accepted' ? 'accepted' : 'dismissed'
  }

  // Dismiss iOS instructions
  const dismissIOSInstructions = () => {
    showIOSInstructions.value = false

    // Store in localStorage to not show again for 30 days
    if (process.client) {
      localStorage.setItem('ios-install-dismissed', Date.now().toString())
    }
  }

  // Check if iOS instructions were recently dismissed
  const shouldShowIOSInstructions = (): boolean => {
    if (!process.client || !isIOS.value || isInstalled.value) {
      return false
    }

    const dismissed = localStorage.getItem('ios-install-dismissed')
    if (!dismissed) return true

    // Show again after 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    return parseInt(dismissed) < thirtyDaysAgo
  }

  // Initialize on mount
  onMounted(() => {
    checkIfInstalled()
    setupInstallPrompt()

    // Auto-show iOS instructions if applicable
    if (shouldShowIOSInstructions()) {
      // Delay to not interrupt initial page load
      setTimeout(() => {
        showIOSInstructions.value = true
      }, 3000)
    }
  })

  return {
    deferredPrompt,
    isInstallable,
    isInstalled,
    isIOS,
    showIOSInstructions,
    promptInstall,
    dismissIOSInstructions,
    shouldShowIOSInstructions
  }
}
