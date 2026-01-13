export default defineNuxtPlugin(async () => {
  // Only run in browser
  if (process.client) {
    try {
      const { openDB } = useIndexedDB()
      // Initialize the database on app start
      await openDB()
      console.log('✓ IndexedDB initialized successfully')
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error)
    }
  }
})
