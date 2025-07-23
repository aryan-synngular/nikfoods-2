// app/api/auth/refresh/route.ts
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import RefreshToken from 'models/RefreshToken'
import User from 'models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'
const JWT_EXPIRES_IN = '1h'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

// Generate new access token
const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const refreshToken = body.refreshToken

    if (!refreshToken) {
      return NextResponse.json({ message: 'Refresh token required' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 })
    }

    if (!decoded || !decoded?.id) {
      return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 })
    }

    const existingUser = await User.findById(decoded.id)
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    const newAccessToken = generateAccessToken({
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
      isCompleted: existingUser.isCompleted,
    })

    const newRefreshToken = jwt.sign({ id: existingUser._id }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    })

    await RefreshToken.findOneAndUpdate(
      { user: existingUser._id },
      { refresh_token: newRefreshToken },
      { upsert: true, new: true }
    )

    return NextResponse.json(
      {
        data: {
          token: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 3600, // 1h in seconds
        },
        message: 'Token refreshed successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 })
  }
}
