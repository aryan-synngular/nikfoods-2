'use client'

import { useState } from 'react'
import { CartPage } from '@my/ui'
import { useRouter } from 'solito/router'
import { useLink } from 'solito/navigation'

export function CartScreen() {
  const checkOutLink = useLink({
    href: '/checkout',
  })
  const router = useRouter()

  const handleBrowse = () => {
    // Navigate to food listing page
    router.push('/')
  }

  console.log('hel')
  const handleCheckout = () => {
    // Navigate to checkout page
    console.log('Cjhekcouit sfjksfsf')
    checkOutLink.onPress()
  }

  return <CartPage onBrowse={handleBrowse} onCheckout={handleCheckout} />
}
