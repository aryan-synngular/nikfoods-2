import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import { verifyAuth } from 'lib/verifyJwt'
import User from 'models/User'
import { ROLE } from 'app/constants/app.constant'

// --- GET all users ---
export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req)
  console.log(authResult)
  if (authResult instanceof NextResponse) {
    return authResult
  }
  const { role } = authResult.user
  if (role != ROLE.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).populate('addresses')

    return NextResponse.json({
      items: users,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
