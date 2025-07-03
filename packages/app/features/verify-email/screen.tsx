import { VerifyEmailPage } from '@my/ui'
import { useEffect, useState } from 'react'

export function VerifyEmailScreen() {
  // Get the email from URL parameters
  const [email, setEmail] = useState<string | null>(null)
  
  useEffect(() => {
    // Get email from URL parameters when component mounts
    const params = new URLSearchParams(window.location.search)
    setEmail(params.get('email'))
  }, [])
  
  // Format the email for display (e.g., raj***@gmail.com)
  const formatEmail = (email: string | null): string => {
    if (!email || Array.isArray(email) || email.length < 5) return 'your email'
    
    const atIndex = email.indexOf('@')
    if (atIndex <= 1) return 'your email'
    
    const username = email.substring(0, atIndex)
    const domain = email.substring(atIndex)
    
    // Show first 3 chars of username and replace rest with asterisks
    const visiblePart = username.substring(0, 3)
    const hiddenPart = '***'
    
    return `${visiblePart}${hiddenPart}${domain}`
  }
  
  const formattedEmail = formatEmail(email)
  
  return <VerifyEmailPage email={formattedEmail} />
}
