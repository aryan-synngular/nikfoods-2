import { SetNewPasswordPage } from '@my/ui'
import { useState } from 'react'

export function SetNewPasswordScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (password: string) => {
    // Show loading state
    setIsSubmitting(true)
    
    // Simulate password update
    setTimeout(() => {
      // Navigate to password changed success page
      window.location.href = '/password-changed'
      setIsSubmitting(false)
    }, 1500) // Simulate a brief delay for better UX
  }
  
  return <SetNewPasswordPage onSubmit={handleSubmit} isSubmitting={isSubmitting} />
}
