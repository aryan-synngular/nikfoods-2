import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { Platform } from 'react-native'

export default withAuth(
  function middleware(req) {
    if (!(Platform.OS === 'web')) return NextResponse.next()
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    console.log('Token:', token)
    console.log('Path:', pathname)

    // Always allow NextAuth API routes
    // if (pathname.startsWith('/api/auth')) return NextResponse.next()

    // Allow all API routes to bypass middleware
    if (pathname.startsWith('/api/')) return NextResponse.next()

    // Define public routes
    const publicRoutePrefixes = ['/login', '/signup', '/forgot-password', '/checkout',"/update-order"]

    // Always allow public routes (including nested paths)
    if (
      publicRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
    ) {
      return NextResponse.next()
    }

    // If user is not logged in, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // If user profile is not completed but accessing other pages
    if (token.isCompleted == false && pathname !== '/add-address') {
      console.log('Not Complete')
      return NextResponse.redirect(new URL('/add-address', req.url))
    }

    // If user is completed but tries to access add-address
    if (token.isCompleted == true && pathname === '/add-address') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true, // Always true; we handle logic manually
    },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
