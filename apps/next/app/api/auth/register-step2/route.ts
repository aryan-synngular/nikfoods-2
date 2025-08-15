import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import User from 'models/User'
import Address from 'models/Address'
import RefreshToken from 'models/RefreshToken'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import mongoose from 'mongoose'
import { verifyAuth } from 'lib/verifyJwt'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'
const JWT_EXPIRES_IN = '1h'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

// ✅ Zod schema for validation
const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  // locationRemark: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email'),
  streetAddress: z.string().min(5, 'Street Address is too short'),
  city: z.string().min(2, 'City is required'),
  // province: z.string().min(2, 'Province is required'),
  postcode: z.string().min(4, 'Postcode is required'),
  // notes: z.string().optional(),
  agreedToTerms: z.boolean().refine((val) => val === true, 'You must agree to terms'),
  agreedToMarketing: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req)

  // If authResult is NextResponse (error), return it directly

  if (authResult instanceof NextResponse) {
    return authResult
  }
  const { id } = authResult.user
  let session: mongoose.ClientSession | null = null
  try {
    await connectToDatabase()

    // ✅ Parse & validate request body
    const body = await req.json()
    console.log(body)
    const parsedData = addressSchema.safeParse(body)

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedData.error.format() },
        { status: 400 }
      )
    }

    const { name, phone, email, streetAddress, city, postcode } =
      parsedData.data

    // ✅ Check if user exists
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    session = await mongoose.startSession()
    session.startTransaction()
    // ✅ Create Address
    const newAddress = await Address.create(
      [
        {
          user: id,
          name,
          // location_remark: locationRemark,
          phone,
          email,
          street_address: streetAddress,
          city,
          // province,
          postal_code: postcode,
          // notes,
        },
      ],
      { session } // important!
    )

    // ✅ Update user (mark complete + add address)
    user.isCompleted = true
    user.addresses = user.addresses || []
    user.addresses.push(newAddress[0]._id)
    await user.save()

    // ✅ Generate new token & refresh token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, isCompleted: true },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    )
    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    })

    // ✅ Update refresh token in DB
    await RefreshToken.findOneAndUpdate(
      { user: user._id },
      { refresh_token: refreshToken, user: user._id },
      { upsert: true, new: true, session }
    )
    await session.commitTransaction()
    session.endSession()

    return NextResponse.json(
      {
        message: 'Profile completed successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            isCompleted: user.isCompleted,
            role: user.role,
          },
          token,
          refreshToken,
          expiresIn: 3600, // 1 hour in seconds
          isCompleted: user.isCompleted,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error completing profile:', error)
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
