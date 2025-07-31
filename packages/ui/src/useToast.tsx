import { useToastController } from '@tamagui/toast'

export const useToast = () => {
  const toast = useToastController()

  // to work with NativeToast
  const showMessage = (message: string, type: 'success' | 'error') => {
    toast.show('', {
      duration: 3000,
      customData: {
        message,
        type,
      },
    })
  }

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    title?: string
  ) => {
    toast.show(title || '', {
      duration: 4000,
      message: title ? message : undefined,
      customData: {
        message: title ? undefined : message, // Use message in customData if no title
        type,
      },
    })
  }

  // Convenience methods
  const success = (message: string, title?: string) => {
    showToast(message, 'success', title)
  }

  const error = (message: string, title?: string) => {
    showToast(message, 'error', title)
  }

  const warning = (message: string, title?: string) => {
    showToast(message, 'warning', title)
  }

  const info = (message: string, title?: string) => {
    showToast(message, 'info', title)
  }

  return {
    showMessage, // Keep your existing method for backward compatibility
    showToast, // New enhanced method
    success,
    error,
    warning,
    info,
  }
}
