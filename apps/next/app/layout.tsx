import type { Metadata } from 'next'
import { NextTamaguiProvider } from 'app/provider/NextTamaguiProvider'
import { inter } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'NikFoods - Indian Food Delivery',
  description: 'Order delicious Indian food for delivery across United States',
  icons: '/favicon.ico',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // You can use `suppressHydrationWarning` to avoid the warning about mismatched content during hydration in dev mode
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Inter font will be loaded via next/font/google */}
      </head>
      <body className="font-inter">
        <NextTamaguiProvider>{children}</NextTamaguiProvider>
      </body>
    </html>
  )
}
