import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import User from 'models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import RefreshToken from 'models/RefreshToken'
import mongoose from 'mongoose'
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'
const JWT_EXPIRES_IN = '1h'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null
  console.log('hashedPassword')

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log(hashedPassword)
    session = await mongoose.startSession()
    session.startTransaction()

    const newUser = await User.create(
      [
        {
          email,
          password: hashedPassword,
        },
      ],
      { session } // important!
    )
    console.log(newUser)
    const token = jwt.sign(
      {
        id: newUser[0].id,
        email: newUser[0].email,
        role: newUser[0].role,
        isCompleted: newUser[0].isCompleted,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    )
    const refreshToken = jwt.sign({ id: newUser[0].id }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    })

    await RefreshToken.findOneAndUpdate(
      { user: newUser[0]._id },
      { refresh_token: refreshToken, user: newUser[0]._id },
      { upsert: true, new: true, session }
    )
    await session.commitTransaction()
    session.endSession()

    return NextResponse.json(
      {
        data: {
          user: {
            id: newUser[0]._id,
            email: newUser[0].email,
            name: newUser[0].name,
            isCompleted: newUser[0].isCompleted,
          },
          token,
          refreshToken,
          expiresIn: 3600, // 1h in seconds
          isCompleted: newUser[0].isCompleted,
        },
        message: 'User registered successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 })
  }
}
