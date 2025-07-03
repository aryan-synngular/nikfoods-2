import { PasswordChangedPage } from '@my/ui'

export function PasswordChangedScreen() {
  const handleContinue = () => {
    // Navigate to login page
    window.location.href = '/login'
  }
  
  return <PasswordChangedPage onContinue={handleContinue} />
}
