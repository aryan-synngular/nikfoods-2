import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, decodeAccessToken } from 'lib/verifyJwt'
import Stripe from 'stripe'
import { serverEnv } from '../../../data/env/server'

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

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
    const {
      amount,
      orderId,
      currency = 'usd',
    } = body as {
      amount: number
      orderId?: string
      currency?: string
    }

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 })
    }

    if (!serverEnv.STRIPE_SECRET_KEY) {
      return NextResponse.json({ success: false, error: 'Stripe not configured' }, { status: 500 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: orderId ? { orderId } : undefined,
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Payment init failed' },
      { status: 500 }
    )
  }
}
