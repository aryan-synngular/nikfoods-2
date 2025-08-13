"use client"

import { CartPage as CartPageComponent } from '@my/ui'
import { useLink } from 'solito/navigation'
export default function CartPage() {
  const checkOutLink = useLink({
    href: '/checkout',
  })
  const homeLink = useLink({
    href: '/',
  })
  const handleBrowse = () => {
    // Navigate to food listing page
    homeLink.onPress()
  }   
  const handleCheckout = () => {
    // Navigate to checkout page
    checkOutLink.onPress()
  }
  return <CartPageComponent onBrowse={handleBrowse} onCheckout={handleCheckout} />
}
