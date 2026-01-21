import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import type { AppSettings } from '~/types/settings'
import { DEFAULT_SETTINGS } from '~/types/settings'

const SETTINGS_KEY = 'app-settings'

export const useSettingsStore = defineStore('settings', () => {
  const { get, put } = useIndexedDB()

  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })
  const loaded = ref(false)

  /**
   * Load settings from IndexedDB
   */
  const loadSettings = async (): Promise<void> => {
    if (import.meta.server) return

    try {
      const stored = await get('settings', SETTINGS_KEY)
      if (stored?.value) {
        // Merge with defaults to handle new settings added in updates
        settings.value = { ...DEFAULT_SETTINGS, ...stored.value }
      }
      loaded.value = true
    } catch (error) {
      console.error('Failed to load settings:', error)
      // Use defaults on error
      settings.value = { ...DEFAULT_SETTINGS }
      loaded.value = true
    }
  }

  /**
   * Save settings to IndexedDB
   */
  const saveSettings = async (): Promise<void> => {
    if (import.meta.server) return

    try {
      // Use toRaw() to get plain object that can be cloned by IndexedDB
      const rawSettings = toRaw(settings.value)
      await put('settings', { key: SETTINGS_KEY, value: { ...rawSettings } })
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  /**
   * Update a single setting
   */
  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> => {
    settings.value[key] = value
    await saveSettings()
  }

  /**
   * Update multiple settings at once
   */
  const updateSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
    settings.value = { ...settings.value, ...newSettings }
    await saveSettings()
  }

  /**
   * Reset all settings to defaults
   */
  const resetSettings = async (): Promise<void> => {
    settings.value = { ...DEFAULT_SETTINGS }
    await saveSettings()
  }

  // Computed getters for common settings
  const soundEnabled = computed(() => settings.value.soundEnabled)
  const hapticEnabled = computed(() => settings.value.hapticEnabled)
  const showCheckoutHints = computed(() => settings.value.showCheckoutHints)
  const defaultGameMode = computed(() => settings.value.defaultGameMode)
  const defaultBotDifficulty = computed(() => settings.value.defaultBotDifficulty)

  return {
    // State
    settings,
    loaded,

    // Computed
    soundEnabled,
    hapticEnabled,
    showCheckoutHints,
    defaultGameMode,
    defaultBotDifficulty,

    // Actions
    loadSettings,
    saveSettings,
    updateSetting,
    updateSettings,
    resetSettings
  }
})
