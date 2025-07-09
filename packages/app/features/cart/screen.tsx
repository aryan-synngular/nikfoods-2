"use client"

import { useState } from 'react'
import { CartPage } from '@my/ui'
import { useRouter } from 'solito/router'

export function CartScreen() {
  const router = useRouter()
  
  const handleBrowse = () => {
    // Navigate to food listing page
    router.push('/')
  }
  
  const handleCheckout = () => {
    // Navigate to checkout page
    router.push('/checkout')
  }
  
  return (
    <CartPage 
      onBrowse={handleBrowse}
      onCheckout={handleCheckout}
    />
  )
}
