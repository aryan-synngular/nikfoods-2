import { useToastController } from '@tamagui/toast'
import { CheckCircle, AlertTriangle } from '@tamagui/lucide-icons'

export const useToast = () => {
  const toast = useToastController()

  const showMessage = (message: string, type: 'success' | 'error') => {
    toast.show(message, {
      duration: 3000,
      theme: type === 'error' ? 'red' : 'green',
      icon:
        type === 'error' ? (
          <AlertTriangle size={18} color="red" />
        ) : (
          <CheckCircle size={18} color="green" />
        ),
    })
  }

  return { showMessage }
}
