export default defineNuxtPlugin(async () => {
  // Only run in browser (the .client.ts suffix already ensures this, but double-check)
  if (import.meta.server) return

  try {
    const { openDB } = useIndexedDB()
    // Initialize the database on app start
    await openDB()
    console.log('✓ IndexedDB initialized successfully')

    // Load settings from IndexedDB
    const settingsStore = useSettingsStore()
    await settingsStore.loadSettings()
    console.log('✓ Settings loaded successfully')
  } catch (error) {
    console.error('Failed to initialize app data:', error)
  }
})
