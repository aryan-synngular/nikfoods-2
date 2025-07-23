import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Address from 'models/Address'
import { verifyAuth } from 'lib/verifyJwt'

// --- GET all categories ---
export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req)

  // If authResult is NextResponse (error), return it directly

  if (authResult instanceof NextResponse) {
    return authResult
  }
  const { id } = authResult.user
  try {
    await connectToDatabase()

    const address = await Address.find({ user: id }).sort({ createdAt: -1 })

    return NextResponse.json({
      items: address,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
