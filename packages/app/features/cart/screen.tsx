'use client'

import { useState } from 'react'
import { CartPage } from '@my/ui'
import { useRouter } from 'solito/router'
import { useLink } from 'solito/navigation'

export function CartScreen() {
  const checkOutLink = useLink({
    href: '/checkout',
  })
  const homeLink = useLink({
    href: '/',
  })
  const router = useRouter()

  const handleBrowse = () => {
    // Navigate to food listing page
    homeLink.onPress()
  }

  console.log('hel')
  const handleCheckout = () => {
    // Navigate to checkout page
    checkOutLink.onPress()
  }

  return <CartPage onBrowse={handleBrowse} onCheckout={handleCheckout} />
}
