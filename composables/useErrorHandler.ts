/**
 * Global Error Handler Composable
 *
 * Provides centralized error handling for the application.
 * Captures Vue errors, unhandled promise rejections, and manual error reports.
 */

export interface AppError {
  id: string
  message: string
  stack?: string
  timestamp: Date
  context?: string
  recoverable: boolean
}

// Reactive state for errors
const errors = ref<AppError[]>([])
const currentError = ref<AppError | null>(null)
const showErrorModal = ref(false)

export const useErrorHandler = () => {
  /**
   * Generate a unique error ID
   */
  const generateErrorId = (): string => {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Report an error to the error handler
   */
  const reportError = (
    error: Error | string,
    context?: string,
    recoverable = true
  ): AppError => {
    const appError: AppError = {
      id: generateErrorId(),
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      timestamp: new Date(),
      context,
      recoverable
    }

    errors.value.push(appError)

    // Keep only the last 50 errors
    if (errors.value.length > 50) {
      errors.value = errors.value.slice(-50)
    }

    // Log to console in development
    if (import.meta.dev) {
      console.error(`[Error Handler] ${context || 'App Error'}:`, error)
    }

    // Show modal for non-recoverable errors
    if (!recoverable) {
      currentError.value = appError
      showErrorModal.value = true
    }

    return appError
  }

  /**
   * Handle Vue component errors
   */
  const handleVueError = (err: unknown, instance: unknown, info: string) => {
    const error = err instanceof Error ? err : new Error(String(err))
    reportError(error, `Vue Error (${info})`, true)
  }

  /**
   * Handle unhandled promise rejections
   */
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason))
    reportError(error, 'Unhandled Promise Rejection', true)
    event.preventDefault()
  }

  /**
   * Handle global errors
   */
  const handleGlobalError = (event: ErrorEvent) => {
    reportError(event.error || new Error(event.message), 'Global Error', true)
  }

  /**
   * Clear a specific error
   */
  const clearError = (errorId: string) => {
    const index = errors.value.findIndex(e => e.id === errorId)
    if (index !== -1) {
      errors.value.splice(index, 1)
    }
    if (currentError.value?.id === errorId) {
      currentError.value = null
      showErrorModal.value = false
    }
  }

  /**
   * Clear all errors
   */
  const clearAllErrors = () => {
    errors.value = []
    currentError.value = null
    showErrorModal.value = false
  }

  /**
   * Dismiss the current error modal
   */
  const dismissError = () => {
    currentError.value = null
    showErrorModal.value = false
  }

  /**
   * Try to recover from an error by reloading the page
   */
  const recoverWithReload = () => {
    window.location.reload()
  }

  /**
   * Safe async wrapper that catches errors
   */
  const safeAsync = async <T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await fn()
    } catch (error) {
      reportError(error instanceof Error ? error : new Error(String(error)), context)
      return null
    }
  }

  /**
   * Install error handlers on the window
   */
  const installGlobalHandlers = () => {
    if (typeof window === 'undefined') return

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleGlobalError)
  }

  /**
   * Remove error handlers from the window
   */
  const removeGlobalHandlers = () => {
    if (typeof window === 'undefined') return

    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    window.removeEventListener('error', handleGlobalError)
  }

  return {
    // State
    errors: readonly(errors),
    currentError: readonly(currentError),
    showErrorModal: readonly(showErrorModal),

    // Methods
    reportError,
    handleVueError,
    clearError,
    clearAllErrors,
    dismissError,
    recoverWithReload,
    safeAsync,
    installGlobalHandlers,
    removeGlobalHandlers
  }
}
