/**
 * Error Handler Plugin
 *
 * Installs global error handlers for:
 * - Vue component errors
 * - Unhandled promise rejections
 * - Global JavaScript errors
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { handleVueError, installGlobalHandlers } = useErrorHandler()

  // Handle Vue component errors
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    handleVueError(err, instance, info)
  }

  // Handle Vue warnings in development
  if (import.meta.dev) {
    nuxtApp.vueApp.config.warnHandler = (msg, instance, trace) => {
      console.warn(`[Vue Warning] ${msg}`, trace)
    }
  }

  // Install global window error handlers
  installGlobalHandlers()

  console.log('✓ Error handler initialized')
})
