// lib/verifyJwt.ts
import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { NextApiRequest } from 'next'
import { authOptions } from './auth'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'
export interface DecodedToken {
  id: string
  email?: string
  isCompleted?: boolean
  iat?: number
  exp?: number
}
export interface Error {
  error: boolean
  message: string
}

const ACCESS_TOKEN_SECRET = JWT_SECRET!

export async function verifyAuth(req: NextRequest) {
  // Check if coming from Expo (Bearer token present)
  console.log(req.headers)
  const authHeader = req.headers.get('authorization')
  console.log('AuthHeader------------------------------------')
  console.log(authHeader)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    console.log('VERIFY EXPO SESSION')

    const token = authHeader.split(' ')[1]
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
      console.log(decoded)
      return { user: decoded, platform: 'expo' }
    } catch (err) {
      console.log(err)
      return NextResponse.json({ error: 'Not Authourized' }, { status: 401 })
    }
  }

  // Otherwise, use NextAuth session for web app
  const session = await getServerSession(authOptions)
  console.log('VERIFY NEXT SESSION')
  console.log(session)
  if (!session) {
    return NextResponse.json({ error: 'Not Authourized' }, { status: 401 })
  }
  return { user: session?.user, platform: 'web' }
}
