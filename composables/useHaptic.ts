/**
 * Haptic feedback composable for touch interactions
 * Provides vibration patterns for different game events
 */
export const useHaptic = () => {
  // Check if haptic feedback is supported
  const isSupported = computed(() => {
    if (!process.client) return false
    return 'vibrate' in navigator
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
   * Trigger a vibration pattern
   * @param pattern - Single duration or array of durations (vibrate, pause, vibrate...)
   */
  const vibrate = (pattern: number | number[]) => {
    if (!isEnabled.value) return

    try {
      navigator.vibrate(pattern)
    } catch (error) {
      // Silently fail - haptics are non-critical
      console.debug('Haptic feedback failed:', error)
    }
  }

  /**
   * Light tap - for button presses and score selection
   */
  const tap = () => {
    vibrate(10)
  }

  /**
   * Medium tap - for confirming actions
   */
  const confirm = () => {
    vibrate(20)
  }

  /**
   * Success pattern - for checkouts and wins
   */
  const success = () => {
    vibrate([50, 50, 50])
  }

  /**
   * Error/Bust pattern - for busts and invalid actions
   */
  const error = () => {
    vibrate([100, 50, 100])
  }

  /**
   * Warning pattern - for warnings
   */
  const warning = () => {
    vibrate([30, 30, 30])
  }

  /**
   * Double tap - for multiplier selection
   */
  const doubleTap = () => {
    vibrate([15, 30, 15])
  }

  /**
   * Heavy impact - for checkout/win celebration
   */
  const heavyImpact = () => {
    vibrate([0, 50, 100])
  }

  return {
    isSupported,
    isEnabled,
    vibrate,
    tap,
    confirm,
    success,
    error,
    warning,
    doubleTap,
    heavyImpact
  }
}
