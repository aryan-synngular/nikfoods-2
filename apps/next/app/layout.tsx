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
    <html lang="en" className={inter.variable}>
    <body className="font-inter">
      <NextTamaguiProvider>{children}</NextTamaguiProvider>
    </body>
  </html>
  )
}
