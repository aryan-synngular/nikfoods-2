import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import Stripe from 'stripe'
import { serverEnv } from '../../../../data/env/server'
import { headers } from 'next/headers'

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = headers().get('stripe-signature')

    if (!signature || !serverEnv.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, serverEnv.STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    await connectToDatabase()

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handlePaymentRefunded(event.data.object as Stripe.Charge)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) {
      console.error('No orderId in payment intent metadata')
      return
    }

    const order = await Order.findOne({ orderId })
    if (!order) {
      console.error(`Order not found: ${orderId}`)
      return
    }

    // Verify payment intent matches
    if (order.stripePaymentIntentId !== paymentIntent.id) {
      console.error(`Payment intent mismatch for order ${orderId}`)
      return
    }

    // Update order status
    order.paymentStatus = 'paid'
    order.status = 'confirmed'
    await order.save()

    console.log(`Order ${orderId} payment confirmed successfully`)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) {
      console.error('No orderId in payment intent metadata')
      return
    }

    const order = await Order.findOne({ orderId })
    if (!order) {
      console.error(`Order not found: ${orderId}`)
      return
    }

    // Update order status
    order.paymentStatus = 'failed'
    order.status = 'cancelled'
    await order.save()

    console.log(`Order ${orderId} payment failed`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) {
      console.error('No orderId in payment intent metadata')
      return
    }

    const order = await Order.findOne({ orderId })
    if (!order) {
      console.error(`Order not found: ${orderId}`)
      return
    }

    // Update order status
    order.paymentStatus = 'failed'
    order.status = 'cancelled'
    await order.save()

    console.log(`Order ${orderId} payment canceled`)
  } catch (error) {
    console.error('Error handling payment cancellation:', error)
  }
}

async function handlePaymentRefunded(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent as string
    if (!paymentIntentId) {
      console.error('No payment intent in charge')
      return
    }

    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId })
    if (!order) {
      console.error(`Order not found for payment intent: ${paymentIntentId}`)
      return
    }

    // Update order status
    order.paymentStatus = 'refunded'
    order.status = 'cancelled'
    await order.save()

    console.log(`Order ${order.orderId} payment refunded`)
  } catch (error) {
    console.error('Error handling payment refund:', error)
  }
}
