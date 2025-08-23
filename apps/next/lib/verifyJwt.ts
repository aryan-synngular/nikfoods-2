// lib/verifyJwt.ts
import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { NextApiRequest } from 'next'
import { authOptions } from './auth'
import { ISession, IUser } from 'app/types/auth'
import { PLATFORM } from 'app/constants/app.constant'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'
const ACCESS_TOKEN_SECRET = JWT_SECRET!

export async function verifyAuth(req: NextRequest) {
  // Check if coming from Expo (Bearer token present)


  const platform = req.headers.get('user-platform')
  if (platform == PLATFORM.MOBILE) {
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('VERIFY EXPO SESSION')

      const token = authHeader.split(' ')[1]
      try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
        if (
          typeof decoded === 'string' ||
          !('email' in decoded && 'role' in decoded && 'isCompleted' in decoded && 'id' in decoded)
        ) {
          return NextResponse.json({ error: 'Not Authorized' }, { status: 401 })
        }
        return { user: decoded as IUser, platform }
      } catch (err) {
        console.log(err)
        return NextResponse.json({ error: 'Not Authourized' }, { status: 401 })
      }
    }
  }

  if (platform == PLATFORM.WEB) {
    // Otherwise, use NextAuth session for web app
    const session: ISession | null = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Not Authourized' }, { status: 401 })
    }
    return { user: session?.user, platform }
  }
  return NextResponse.json({ error: 'Not Authourized' }, { status: 401 })
}

// Added: decode a JWT access token payload and return IUser. Throws 'INVALID_TOKEN' on error
export function decodeAccessToken(token: string): IUser {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
    if (
      typeof decoded === 'string' ||
      !('email' in decoded && 'role' in decoded && 'isCompleted' in decoded && 'id' in decoded)
    ) {
      throw new Error('INVALID_TOKEN')
    }
    return decoded as IUser
  } catch (error) {
    throw new Error('INVALID_TOKEN')
  }
}
