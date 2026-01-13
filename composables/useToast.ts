interface ToastOptions {
  message: string
  title?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface Toast extends ToastOptions {
  id: string
}

const toasts = ref<Toast[]>([])

export const useToast = () => {
  const show = (options: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const toast: Toast = {
      id,
      ...options
    }

    toasts.value.push(toast)

    // Auto-remove after duration
    const duration = options.duration ?? 3000
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration + 300) // Add 300ms for exit animation
    }
  }

  const remove = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, title?: string) => {
    show({ message, title, variant: 'success' })
  }

  const error = (message: string, title?: string) => {
    show({ message, title, variant: 'error' })
  }

  const warning = (message: string, title?: string) => {
    show({ message, title, variant: 'warning' })
  }

  const info = (message: string, title?: string) => {
    show({ message, title, variant: 'info' })
  }

  return {
    toasts: readonly(toasts),
    show,
    remove,
    success,
    error,
    warning,
    info
  }
}
