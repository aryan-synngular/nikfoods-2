import { ForgotPasswordPage } from '@my/ui'
import { useState } from 'react'

export function ForgotPasswordScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleSubmit = (email: string) => {
    // Show loading state
    setIsSubmitting(true)
    
    // Simulate sending verification code to email
    setTimeout(() => {
      // Use direct browser navigation which works in both Next.js App Router and other contexts
      window.location.href = `/verify-email?email=${encodeURIComponent(email)}`
      setIsSubmitting(false)
    }, 1000) // Simulate a brief delay for better UX
  }
  
  return <ForgotPasswordPage onSubmit={handleSubmit} isSubmitting={isSubmitting} />
}
