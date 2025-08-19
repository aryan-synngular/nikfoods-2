import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { SquareClient, SquareEnvironment } from 'square'
import { verifyAuth, decodeAccessToken } from 'lib/verifyJwt'

const client = new SquareClient({
  token: () => 'EAAAl-uJIzKqVe2F19gIOgMUrEdyl_VdQtIPZEba3mVz0auwxnDCfNQUOscrPIfB',
  environment: SquareEnvironment.Sandbox,
})

const paymentsApi = client.payments

export async function POST(req: NextRequest) {
  // Optional auth via token or session
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (token) {
    try {
      decodeAccessToken(token)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }
  } else {
    const authResult = await verifyAuth(req)
    if (authResult instanceof NextResponse) return authResult
  }

  try {
    const body = await req.json()
    const { sourceId, amount, buyerVerificationToken, orderId } = body

    const result = await paymentsApi.create({
      idempotencyKey: orderId,
      sourceId,
      amountMoney: {
        currency: 'USD',
        amount: BigInt(amount), // or BigInt(10000)
      },
    })

    return NextResponse.json({
      success: true,
      result: JSON.parse(
        JSON.stringify(result, (_key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      ),
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: error.message || 'Payment failed' },
      { status: 500 }
    )
  }
}
