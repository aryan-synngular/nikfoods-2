import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { verifyAuth } from 'lib/verifyJwt'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) return authResult

  const { id, email, role, isCompleted } = authResult.user

  try {
    const token = jwt.sign({ id, email, role, isCompleted }, JWT_SECRET, {
      expiresIn: '10m',
    })

    return NextResponse.json({ token, expiresIn: 600 })
  } catch (error) {
    console.error('Error generating token:', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
