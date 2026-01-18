<template>
  <div class="min-h-screen bg-slate-950 safe-top safe-bottom">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
      <div class="max-w-2xl mx-auto px-4 py-4">
        <div class="flex items-center gap-4">
          <button
            @click="navigateTo('/')"
            class="p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Back to home"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-white">Settings</h1>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-2xl mx-auto px-4 py-6">
      <div class="space-y-6">
        <!-- Game Defaults Section -->
        <section class="card">
          <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Game Defaults
          </h2>
          <p class="text-sm text-slate-400 mb-4">
            These settings will be pre-selected when starting a new game.
          </p>

          <div class="space-y-4">
            <!-- Default Game Mode -->
            <div>
              <label class="block text-white font-medium mb-2">Default Game Mode</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="mode in gameModes"
                  :key="mode"
                  @click="updateSetting('defaultGameMode', mode)"
                  :class="[
                    'py-3 px-4 rounded-lg border-2 font-bold transition-all',
                    settings.defaultGameMode === mode
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  ]"
                >
                  {{ mode }}
                </button>
              </div>
            </div>

            <!-- Double In -->
            <SettingsToggle
              label="Double In"
              description="Must hit a double to start scoring"
              :model-value="settings.defaultDoubleIn"
              @update:model-value="updateSetting('defaultDoubleIn', $event)"
            />

            <!-- Double Out -->
            <SettingsToggle
              label="Double Out"
              description="Must finish on a double (standard rule)"
              :model-value="settings.defaultDoubleOut"
              @update:model-value="updateSetting('defaultDoubleOut', $event)"
            />

            <!-- Default Sets -->
            <div>
              <label class="block text-white font-medium mb-2">Default Sets</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="setCount in [1, 3, 5]"
                  :key="setCount"
                  @click="updateSetting('defaultSets', setCount)"
                  :class="[
                    'py-3 px-4 rounded-lg border-2 font-medium transition-all',
                    settings.defaultSets === setCount
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  ]"
                >
                  {{ setCount === 1 ? '1 Set' : `Best of ${setCount}` }}
                </button>
              </div>
            </div>

            <!-- Default Legs -->
            <div>
              <label class="block text-white font-medium mb-2">Default Legs per Set</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="legCount in [1, 3, 5]"
                  :key="legCount"
                  @click="updateSetting('defaultLegs', legCount)"
                  :class="[
                    'py-3 px-4 rounded-lg border-2 font-medium transition-all',
                    settings.defaultLegs === legCount
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  ]"
                >
                  {{ legCount === 1 ? '1 Leg' : `Best of ${legCount}` }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Experience Section -->
        <section class="card">
          <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Experience
          </h2>

          <div class="space-y-4">
            <!-- Sound -->
            <SettingsToggle
              label="Sound Effects"
              description="Play sounds for checkout, bust, etc."
              :model-value="settings.soundEnabled"
              @update:model-value="updateSetting('soundEnabled', $event)"
            />

            <!-- Haptic Feedback -->
            <SettingsToggle
              label="Haptic Feedback"
              description="Vibration feedback when entering scores"
              :model-value="settings.hapticEnabled"
              @update:model-value="updateSetting('hapticEnabled', $event)"
              :disabled="!supportsHaptic"
              :disabled-reason="!supportsHaptic ? 'Not supported on this device' : undefined"
            />

            <!-- Checkout Hints -->
            <SettingsToggle
              label="Checkout Suggestions"
              description="Show possible checkouts when in range"
              :model-value="settings.showCheckoutHints"
              @update:model-value="updateSetting('showCheckoutHints', $event)"
            />
          </div>
        </section>

        <!-- Data Section -->
        <section class="card">
          <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            Reset Settings
          </h2>

          <div class="space-y-4">
            <!-- Reset Settings -->
            <button
              @click="confirmResetSettings"
              class="w-full py-3 px-4 rounded-lg border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white transition-all"
            >
              Reset to Default Settings
            </button>
          </div>
        </section>

        <!-- About Section -->
        <section class="card">
          <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About
          </h2>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Version</span>
              <div class="flex items-center gap-2">
                <span class="text-white font-mono">{{ formattedVersion }}</span>
                <span class="px-1.5 py-0.5 text-xs rounded bg-primary-500/20 text-primary-400">
                  {{ releaseLabel }}
                </span>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Release Date</span>
              <span class="text-white">{{ versionInfo.date }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">PWA Status</span>
              <span :class="isInstalled ? 'text-green-400' : 'text-slate-400'">
                {{ isInstalled ? 'Installed' : 'Browser' }}
              </span>
            </div>
          </div>

          <!-- What's New -->
          <div class="mt-4 pt-4 border-t border-slate-700">
            <h3 class="text-sm font-medium text-slate-300 mb-2">What's New in {{ formattedVersion }}</h3>
            <ul class="space-y-1">
              <li
                v-for="(change, index) in latestChanges"
                :key="index"
                class="text-xs text-slate-400 flex items-start gap-2"
              >
                <span :class="getChangeTypeColor(change.type)">{{ getChangeTypeIcon(change.type) }}</span>
                <span>{{ change.description }}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>

    <!-- Reset Confirmation Modal -->
    <UiModal
      :is-open="showResetConfirm"
      title="Reset Settings?"
      @close="showResetConfirm = false"
    >
      <p class="text-slate-300 mb-6">
        This will reset all settings to their default values. Your game data and players will not be affected.
      </p>
      <div class="flex gap-3">
        <UiButton
          variant="secondary"
          full-width
          @click="showResetConfirm = false"
        >
          Cancel
        </UiButton>
        <UiButton
          variant="primary"
          full-width
          @click="handleResetSettings"
        >
          Reset
        </UiButton>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { GameMode } from '~/types/game'
import type { AppSettings } from '~/types/settings'
import type { ChangelogEntry } from '~/utils/changelog'

useHead({
  title: 'Settings - Dart Counter'
})

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)
const { isInstalled } = useInstallPrompt()
const { formattedVersion, versionInfo, releaseLabel, changelog } = useVersion()
const toast = useToast()

const gameModes: GameMode[] = ['301', '501', '701']
const showResetConfirm = ref(false)

// Load settings on mount
onMounted(async () => {
  await settingsStore.loadSettings()
})

// Check haptic support
const supportsHaptic = computed(() => {
  if (import.meta.server) return false
  return 'vibrate' in navigator
})

// Storage info (simplified)
const storageInfo = computed(() => {
  if (import.meta.server) return 'N/A'
  return 'IndexedDB'
})

// Latest changes from changelog
const latestChanges = computed(() => {
  return changelog.value[0]?.changes.slice(0, 5) ?? []
})

// Helper functions for change type display
const getChangeTypeIcon = (type: ChangelogEntry['changes'][0]['type']) => {
  const icons: Record<string, string> = {
    added: '+',
    changed: '~',
    fixed: '✓',
    removed: '-',
    security: '!'
  }
  return icons[type] ?? '•'
}

const getChangeTypeColor = (type: ChangelogEntry['changes'][0]['type']) => {
  const colors: Record<string, string> = {
    added: 'text-green-400',
    changed: 'text-blue-400',
    fixed: 'text-amber-400',
    removed: 'text-red-400',
    security: 'text-red-500'
  }
  return colors[type] ?? 'text-slate-400'
}

// Update a single setting
const updateSetting = async <K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
) => {
  await settingsStore.updateSetting(key, value)
}

// Confirm reset settings
const confirmResetSettings = () => {
  showResetConfirm.value = true
}

// Handle reset settings
const handleResetSettings = async () => {
  await settingsStore.resetSettings()
  showResetConfirm.value = false
  toast.success('Settings have been reset to defaults', 'Reset Complete')
}
</script>
