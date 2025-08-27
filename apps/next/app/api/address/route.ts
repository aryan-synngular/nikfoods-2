import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Address from 'models/Address'
import Zincode from 'models/Zincode'
import { verifyAuth, decodeAccessToken } from 'lib/verifyJwt'
import mongoose from 'mongoose'
import { z } from 'zod'
import User from 'models/User'

// --- GET all categories ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  let userId: string | null = null

  // If token provided in query, try to decode and use it instead of verifyAuth
  if (token) {
    try {
      const user = decodeAccessToken(token)
      userId = user.id
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }
  }

  // Fallback to regular auth if no token provided
  let id: string
  if (!userId) {
    const authResult = await verifyAuth(req)

    // If authResult is NextResponse (error), return it directly

    if (authResult instanceof NextResponse) {
      return authResult
    }
    id = authResult.user.id
  } else {
    id = userId
  }
  try {
    await connectToDatabase()
    console.log('ID:', id)
    const addresses = await Address.find({ user: id }).sort({ createdAt: -1 })

    // Get minCartValue for each address based on postal code
    const addressesWithMinCartValue = await Promise.all(
      addresses.map(async (address) => {
        const zincode = await Zincode.findOne({ zipcode: address.postal_code })
        return {
          ...address.toObject(),
          minCartValue: zincode?.minCartValue || 0
        }
      })
    )

    return NextResponse.json({
      data: {
        items: addressesWithMinCartValue,
        page: 1,
        pageSize: 5,
        total: addressesWithMinCartValue.length,
      },
      message: 'Address fetched successfully',
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  // location_remark: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email'),
  street_address: z.string().min(5, 'Street Address is too short'),
  city: z.string().min(2, 'City is required'),
  // province: z.string().min(2, 'Province is required'),
  postal_code: z.string().min(4, 'Postcode is required'),
  // notes: z.string().optional(),
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

    const {
      name,
      // location_remark,
      phone,
      email,
      street_address,
      city,
      // province,
      postal_code,
      // notes,
    } = parsedData.data

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
          // location_remark,
          phone,
          email,
          street_address,
          city,
          // province,
          postal_code,
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

    await session.commitTransaction()
    session.endSession()

    return NextResponse.json(
      {
        message: 'Address added successfully',
        data: newAddress[0],
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

export async function PUT(req: NextRequest) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) return authResult

  const { id: userId } = authResult.user
  let session: mongoose.ClientSession | null = null

  try {
    await connectToDatabase()
    const body = await req.json()
    const addressId = body._id
    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    const parsed = addressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      )
    }

    session = await mongoose.startSession()
    session.startTransaction()

    const updated = await Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      {
        name: parsed.data.name,
        // location_remark: parsed.data.location_remark,
        phone: parsed.data.phone,
        email: parsed.data.email,
        street_address: parsed.data.street_address,
        city: parsed.data.city,
        // province: parsed.data.province,
        postal_code: parsed.data.postal_code,
        // notes: parsed.data.notes,
      },
      { new: true, session }
    )

    if (!updated) {
      await session.abortTransaction()
      session.endSession()
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 })
    }

    await session.commitTransaction()
    session.endSession()

    return NextResponse.json({ message: 'Address updated successfully', data: updated })
  } catch (error) {
    console.error('Error updating address:', error)
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) return authResult

  const { id: userId } = authResult.user
  let session: mongoose.ClientSession | null = null

  try {
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const addressId = searchParams.get('id')
    if (!addressId) {
      return NextResponse.json({ error: 'Missing address id' }, { status: 400 })
    }

    session = await mongoose.startSession()
    session.startTransaction()

    const address = await Address.findOneAndDelete({ _id: addressId, user: userId }, { session })

    if (!address) {
      await session.abortTransaction()
      session.endSession()
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 })
    }

    // Remove from user's address list
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { addresses: addressId },
      },
      { session }
    )

    await session.commitTransaction()
    session.endSession()

    return NextResponse.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Error deleting address:', error)
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}
