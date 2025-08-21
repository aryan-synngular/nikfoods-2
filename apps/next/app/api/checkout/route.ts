import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, decodeAccessToken } from 'lib/verifyJwt'

export async function POST(req: NextRequest) {
  // This endpoint is deprecated - redirect to the new secure order creation flow
  return NextResponse.json(
    {
      success: false,
      error: 'This endpoint is deprecated. Please use /api/orders/create instead.',
      redirectTo: '/api/orders/create',
    },
    { status: 410 }
  )
}
