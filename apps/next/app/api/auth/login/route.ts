import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import User from 'models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import RefreshToken from 'models/RefreshToken'
import mongoose from 'mongoose'
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'
const JWT_EXPIRES_IN = '1d'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (!existingUser) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 })
    }

    console.log(existingUser)

    const isValidPassword = await bcrypt.compare(password, existingUser.password)
    if (!isValidPassword)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })

    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
        isCompleted: existingUser.isCompleted,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    )
    const refreshToken = jwt.sign({ id: existingUser._id }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    })

    await RefreshToken.findOneAndUpdate(
      { user: existingUser._id },
      { refresh_token: refreshToken },
      { upsert: true, new: true }
    )
    return NextResponse.json(
      {
        data: {
          user: {
            id: existingUser._id,
            email: existingUser.email,
            name: existingUser.name,
            isCompleted: existingUser.isCompleted,
          },
          token,
          refreshToken,
          expiresIn: 3600, // 1h in seconds
          isCompleted: existingUser.isCompleted,
        },
        message: 'User loggedin successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Loggin error:', error)
    return NextResponse.json({ error: 'Failed to loggin user' }, { status: 500 })
  }
}
