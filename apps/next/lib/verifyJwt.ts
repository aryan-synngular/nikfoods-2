// lib/verifyJwt.ts
import jwt from 'jsonwebtoken'
import RefreshToken from 'models/RefreshToken'
import User from 'models/User'
import { getServerSession } from 'next-auth/next'
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'
const JWT_EXPIRES_IN = '1h'
const REFRESH_TOKEN_EXPIRES_IN = '7d'
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

export async function verifyJwt(req: Request): Promise<DecodedToken | Error> {
  const nextSession = await getServerSession()
  console.log(nextSession)
  const authHeader = req.headers.get('authorization')
  console.log('Verify JWT')
  console.log(authHeader)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: true, message: 'Invalid Token' }
  }

  const token = authHeader.split(' ')[1]
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      // Try refresh
      const payload: any = jwt.decode(token)
      const refreshEntry = await RefreshToken.findOne({ user: payload.id })
      if (!refreshEntry) {
        return { error: true, message: 'Session expired' }
      }

      // Verify refresh token
      try {
        jwt.verify(refreshEntry.refresh_token, JWT_SECRET)
      } catch (err) {
        return { error: true, message: 'Invalid refresh token' }
      }

      // Generate new token
      const user = await User.findById(payload.id)
      if (!user) {
        return { error: true, message: 'User not found' }
      }

      const newToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role, isCompleted: user.isCompleted },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      return { ...user, token: newToken }
    }

    console.error('JWT verification failed:', error)

    return { error: true, message: 'Unauthorised' }
  }
}
