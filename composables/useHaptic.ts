/**
 * Haptic feedback composable for touch interactions
 * Provides vibration patterns for different game events
 *
 * Uses ios-haptics library which works on:
 * - iOS Safari 17.4+ (using hidden checkbox switch trick)
 * - Android browsers (using navigator.vibrate)
 */

// Import haptic functions from ios-haptics library
// This library uses a clever trick: on iOS Safari 17.4+, it creates a hidden
// <input type="checkbox" switch> element and toggles it, which triggers haptic feedback
let hapticLib: typeof import('ios-haptics') | null = null

// Lazy load the library only on client
const loadHapticLib = async () => {
  if (import.meta.server) return null
  if (!hapticLib) {
    try {
      hapticLib = await import('ios-haptics')
    } catch (e) {
      console.debug('Failed to load ios-haptics:', e)
    }
  }
  return hapticLib
}

export const useHaptic = () => {
  // Check if we're on a touch device (haptics make sense on mobile)
  const isSupported = computed(() => {
    if (import.meta.server) return false
    // Check for touch support or vibration API
    return 'ontouchstart' in window || 'vibrate' in navigator
  })

  // Lazy load settings to avoid circular dependency
  const isEnabled = computed(() => {
    if (!isSupported.value) return false

    try {
      const settingsStore = useSettingsStore()
      return settingsStore.hapticEnabled
    } catch {
      // Default to enabled if store not available yet
      return true
    }
  })

  /**
   * Trigger a single haptic pulse
   * Works on iOS Safari 17.4+ and Android
   */
  const triggerHaptic = async () => {
    if (!isEnabled.value) return

    try {
      const lib = await loadHapticLib()
      if (lib?.haptic) {
        lib.haptic()
      }
    } catch (error) {
      // Silently fail - haptics are non-critical
      console.debug('Haptic feedback failed:', error)
    }
  }

  /**
   * Trigger confirm haptic pattern (double pulse)
   */
  const triggerConfirm = async () => {
    if (!isEnabled.value) return

    try {
      const lib = await loadHapticLib()
      if (lib?.haptic?.confirm) {
        lib.haptic.confirm()
      }
    } catch (error) {
      console.debug('Haptic feedback failed:', error)
    }
  }

  /**
   * Trigger error haptic pattern (triple pulse)
   */
  const triggerError = async () => {
    if (!isEnabled.value) return

    try {
      const lib = await loadHapticLib()
      if (lib?.haptic?.error) {
        lib.haptic.error()
      }
    } catch (error) {
      console.debug('Haptic feedback failed:', error)
    }
  }

  /**
   * Light tap - for button presses and score selection
   */
  const tap = () => {
    triggerHaptic()
  }

  /**
   * Medium tap - for confirming actions
   */
  const confirm = () => {
    triggerConfirm()
  }

  /**
   * Success pattern - for checkouts and wins
   */
  const success = () => {
    triggerConfirm()
  }

  /**
   * Error/Bust pattern - for busts and invalid actions
   */
  const error = () => {
    triggerError()
  }

  /**
   * Warning pattern - for warnings
   */
  const warning = () => {
    triggerHaptic()
  }

  /**
   * Double tap - for multiplier selection
   */
  const doubleTap = () => {
    triggerConfirm()
  }

  /**
   * Heavy impact - for checkout/win celebration
   */
  const heavyImpact = () => {
    triggerConfirm()
  }

  return {
    isSupported,
    isEnabled,
    tap,
    confirm,
    success,
    error,
    warning,
    doubleTap,
    heavyImpact
  }
}
