import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Cart from 'models/Cart'
import { verifyAuth } from 'lib/verifyJwt'
import { z } from 'zod'

const updateAddressSchema = z.object({
  addressId: z.string().min(1, 'Address ID is required'),
})

export async function PUT(req: NextRequest) {
  let userId: string | null = null
  const authResult = await verifyAuth(req)

  if (authResult instanceof NextResponse) {
    return authResult
  }
  userId = authResult.user.id

  try {
    const jsonData = await req.json()
    const { addressId } = updateAddressSchema.parse(jsonData)

    await connectToDatabase()

    // Find the user's cart
    let cart = await Cart.findOne({ user: userId })

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = await Cart.create({ 
        user: userId, 
        days: [],
        selectedAddress: addressId
      })
    } else {
      // Update the existing cart with the new selected address
      cart.selectedAddress = addressId
      await cart.save()
    }

    // Populate the selected address for the response
    await cart.populate('selectedAddress')

    return NextResponse.json(
      { 
        message: 'Cart address updated successfully', 
        data: { selectedAddress: cart.selectedAddress }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to update cart address:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update cart address' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  let userId: string | null = null
  const authResult = await verifyAuth(req)

  if (authResult instanceof NextResponse) {
    return authResult
  }
  userId = authResult.user.id

  try {
    await connectToDatabase()

    const cart = await Cart.findOne({ user: userId }).populate('selectedAddress')

    if (!cart) {
      return NextResponse.json(
        { message: 'No cart found', data: { selectedAddress: null } },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Cart address fetched successfully', 
        data: { selectedAddress: cart.selectedAddress }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to fetch cart address:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart address' },
      { status: 500 }
    )
  }
}
