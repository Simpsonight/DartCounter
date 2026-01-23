import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * Tests for the error handler logic.
 * These test the core error handling functionality.
 */

// Simplified error handler implementation for testing
interface AppError {
  id: string
  message: string
  stack?: string
  timestamp: Date
  context?: string
  recoverable: boolean
}

const createErrorHandler = () => {
  let errors: AppError[] = []
  let currentError: AppError | null = null
  let showErrorModal = false

  const generateErrorId = (): string => {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

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

    errors.push(appError)

    if (errors.length > 50) {
      errors = errors.slice(-50)
    }

    if (!recoverable) {
      currentError = appError
      showErrorModal = true
    }

    return appError
  }

  const clearError = (errorId: string) => {
    const index = errors.findIndex(e => e.id === errorId)
    if (index !== -1) {
      errors.splice(index, 1)
    }
    if (currentError?.id === errorId) {
      currentError = null
      showErrorModal = false
    }
  }

  const clearAllErrors = () => {
    errors = []
    currentError = null
    showErrorModal = false
  }

  const dismissError = () => {
    currentError = null
    showErrorModal = false
  }

  return {
    getErrors: () => errors,
    getCurrentError: () => currentError,
    getShowErrorModal: () => showErrorModal,
    reportError,
    clearError,
    clearAllErrors,
    dismissError
  }
}

describe('Error Handler', () => {
  let handler: ReturnType<typeof createErrorHandler>

  beforeEach(() => {
    handler = createErrorHandler()
  })

  describe('reportError', () => {
    it('should add error to the list', () => {
      handler.reportError('Test error')
      expect(handler.getErrors().length).toBe(1)
      expect(handler.getErrors()[0].message).toBe('Test error')
    })

    it('should handle Error objects', () => {
      const error = new Error('Error object test')
      handler.reportError(error)
      expect(handler.getErrors()[0].message).toBe('Error object test')
      expect(handler.getErrors()[0].stack).toBeDefined()
    })

    it('should include context when provided', () => {
      handler.reportError('Test error', 'TestContext')
      expect(handler.getErrors()[0].context).toBe('TestContext')
    })

    it('should set recoverable flag', () => {
      handler.reportError('Recoverable error', undefined, true)
      expect(handler.getErrors()[0].recoverable).toBe(true)

      handler.reportError('Non-recoverable error', undefined, false)
      expect(handler.getErrors()[1].recoverable).toBe(false)
    })

    it('should show modal for non-recoverable errors', () => {
      handler.reportError('Fatal error', undefined, false)
      expect(handler.getShowErrorModal()).toBe(true)
      expect(handler.getCurrentError()?.message).toBe('Fatal error')
    })

    it('should not show modal for recoverable errors', () => {
      handler.reportError('Minor error', undefined, true)
      expect(handler.getShowErrorModal()).toBe(false)
      expect(handler.getCurrentError()).toBeNull()
    })

    it('should limit errors to 50', () => {
      for (let i = 0; i < 60; i++) {
        handler.reportError(`Error ${i}`)
      }
      expect(handler.getErrors().length).toBe(50)
      // Should keep the last 50 (errors 10-59)
      expect(handler.getErrors()[0].message).toBe('Error 10')
      expect(handler.getErrors()[49].message).toBe('Error 59')
    })

    it('should generate unique IDs', () => {
      handler.reportError('Error 1')
      handler.reportError('Error 2')
      const ids = handler.getErrors().map(e => e.id)
      expect(ids[0]).not.toBe(ids[1])
    })

    it('should set timestamp', () => {
      const before = new Date()
      handler.reportError('Test')
      const after = new Date()
      const errorTime = handler.getErrors()[0].timestamp
      expect(errorTime.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(errorTime.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('clearError', () => {
    it('should remove specific error by ID', () => {
      const error1 = handler.reportError('Error 1')
      handler.reportError('Error 2')

      handler.clearError(error1.id)

      expect(handler.getErrors().length).toBe(1)
      expect(handler.getErrors()[0].message).toBe('Error 2')
    })

    it('should close modal if current error is cleared', () => {
      const error = handler.reportError('Fatal', undefined, false)
      expect(handler.getShowErrorModal()).toBe(true)

      handler.clearError(error.id)

      expect(handler.getShowErrorModal()).toBe(false)
      expect(handler.getCurrentError()).toBeNull()
    })

    it('should do nothing if ID not found', () => {
      handler.reportError('Error 1')
      handler.clearError('non-existent-id')
      expect(handler.getErrors().length).toBe(1)
    })
  })

  describe('clearAllErrors', () => {
    it('should remove all errors', () => {
      handler.reportError('Error 1')
      handler.reportError('Error 2')
      handler.reportError('Error 3')

      handler.clearAllErrors()

      expect(handler.getErrors().length).toBe(0)
    })

    it('should close modal', () => {
      handler.reportError('Fatal', undefined, false)
      handler.clearAllErrors()
      expect(handler.getShowErrorModal()).toBe(false)
      expect(handler.getCurrentError()).toBeNull()
    })
  })

  describe('dismissError', () => {
    it('should close modal but keep error in list', () => {
      handler.reportError('Fatal', undefined, false)

      handler.dismissError()

      expect(handler.getShowErrorModal()).toBe(false)
      expect(handler.getCurrentError()).toBeNull()
      expect(handler.getErrors().length).toBe(1)
    })
  })
})

describe('Safe Async Wrapper', () => {
  const safeAsync = async <T>(
    fn: () => Promise<T>,
    onError: (error: Error) => void
  ): Promise<T | null> => {
    try {
      return await fn()
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)))
      return null
    }
  }

  it('should return result on success', async () => {
    const result = await safeAsync(
      async () => 'success',
      () => {}
    )
    expect(result).toBe('success')
  })

  it('should return null on error', async () => {
    const result = await safeAsync(
      async () => { throw new Error('test') },
      () => {}
    )
    expect(result).toBeNull()
  })

  it('should call error handler on failure', async () => {
    const errorHandler = vi.fn()

    await safeAsync(
      async () => { throw new Error('test error') },
      errorHandler
    )

    expect(errorHandler).toHaveBeenCalledWith(expect.any(Error))
    expect(errorHandler.mock.calls[0][0].message).toBe('test error')
  })

  it('should handle non-Error throws', async () => {
    const errorHandler = vi.fn()

    await safeAsync(
      async () => { throw 'string error' },
      errorHandler
    )

    expect(errorHandler).toHaveBeenCalledWith(expect.any(Error))
    expect(errorHandler.mock.calls[0][0].message).toBe('string error')
  })
})
