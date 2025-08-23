import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import UpdateOrder from 'models/UpdateOrder'
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
    const orderType = paymentIntent.metadata?.orderType
    const updatingOrderId = paymentIntent.metadata?.updatingOrderId
console.log(paymentIntent?.metadata)
    if (!orderId) {
      console.error('No orderId in payment intent metadata')
      return
    }

    console.log(`Processing payment success for orderType: ${orderType}, orderId: ${orderId}`)

    if (orderType === 'UPDATE' && updatingOrderId) {
      // Handle updating order payment success
      await handleUpdatingOrderPaymentSuccess(updatingOrderId, paymentIntent)
    } else if (orderType === 'NEW') {
      // Handle regular order payment success
      await handleRegularOrderPaymentSuccess(orderId, paymentIntent)
    } else {
      console.error(`Unknown orderType: ${orderType} or missing updatingOrderId for UPDATE type`)
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handleRegularOrderPaymentSuccess(
  orderId: string,
  paymentIntent: Stripe.PaymentIntent
) {
  const order = await Order.findOne({ orderId })
  console.log("Order hook")
  console.log(order)

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

  console.log(`Regular order ${orderId} payment confirmed successfully`)
}

async function handleUpdatingOrderPaymentSuccess(
  updatingOrderId: string,
  paymentIntent: Stripe.PaymentIntent
) {
  const updatingOrder = await UpdateOrder.findById(updatingOrderId)
  console.log("updatingOrder hook")
  console.log(updatingOrder)
  if (!updatingOrder) {
    console.error(`Updating order not found: ${updatingOrderId}`)
    return
  }

  // Update updating order status
  updatingOrder.paymentStatus = 'paid'
  updatingOrder.status = 'confirmed'
  await updatingOrder.save()

  console.log(`Updating order ${updatingOrderId} payment confirmed successfully`)
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log("paymentIntent---")
    console.log(paymentIntent)
    const orderId = paymentIntent.metadata?.orderId
    const orderType = paymentIntent.metadata?.orderType
    const updatingOrderId = paymentIntent.metadata?.updatingOrderId

    if (!orderId) {
      console.error('No orderId in payment intent metadata')
      return
    }

    console.log(`Processing payment failure for orderType: ${orderType}, orderId: ${orderId}`)

    if (orderType === 'UPDATE' && updatingOrderId) {
      // Handle updating order payment failure
      await handleUpdatingOrderPaymentFailure(updatingOrderId)
    } else if (orderType === 'NEW') {
      // Handle regular order payment failure
      await handleRegularOrderPaymentFailure(orderId)
    } else {
      console.error(`Unknown orderType: ${orderType} or missing updatingOrderId for UPDATE type`)
    }
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handleRegularOrderPaymentFailure(orderId: string) {
  const order = await Order.findOne({ orderId })
  if (!order) {
    console.error(`Order not found: ${orderId}`)
    return
  }

  // Update order status
  order.paymentStatus = 'failed'
  order.status = 'cancelled'
  await order.save()

  console.log(`Regular order ${orderId} payment failed`)
}

async function handleUpdatingOrderPaymentFailure(updatingOrderId: string) {
  const updatingOrder = await UpdateOrder.findById(updatingOrderId)
  if (!updatingOrder) {
    console.error(`Updating order not found: ${updatingOrderId}`)
    return
  }

  // Update updating order status
  updatingOrder.paymentStatus = 'failed'
  updatingOrder.status = 'cancelled'
  await updatingOrder.save()

  console.log(`Updating order ${updatingOrderId} payment failed`)
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    const orderType = paymentIntent.metadata?.orderType
    const updatingOrderId = paymentIntent.metadata?.updatingOrderId

    if (!orderId) {
      console.error('No orderId in payment intent metadata')
      return
    }

    console.log(`Processing payment cancellation for orderType: ${orderType}, orderId: ${orderId}`)

    if (orderType === 'UPDATE' && updatingOrderId) {
      // Handle updating order payment cancellation
      await handleUpdatingOrderPaymentCanceled(updatingOrderId)
    } else if (orderType === 'NEW') {
      // Handle regular order payment cancellation
      await handleRegularOrderPaymentCanceled(orderId)
    } else {
      console.error(`Unknown orderType: ${orderType} or missing updatingOrderId for UPDATE type`)
    }
  } catch (error) {
    console.error('Error handling payment cancellation:', error)
  }
}

async function handleRegularOrderPaymentCanceled(orderId: string) {
  const order = await Order.findOne({ orderId })
  if (!order) {
    console.error(`Order not found: ${orderId}`)
    return
  }

  // Update order status
  order.paymentStatus = 'failed'
  order.status = 'cancelled'
  await order.save()

  console.log(`Regular order ${orderId} payment canceled`)
}

async function handleUpdatingOrderPaymentCanceled(updatingOrderId: string) {
  const updatingOrder = await UpdateOrder.findById(updatingOrderId)
  if (!updatingOrder) {
    console.error(`Updating order not found: ${updatingOrderId}`)
    return
  }

  // Update updating order status
  updatingOrder.paymentStatus = 'failed'
  updatingOrder.status = 'cancelled'
  await updatingOrder.save()

  console.log(`Updating order ${updatingOrderId} payment canceled`)
}

async function handlePaymentRefunded(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent as string
    if (!paymentIntentId) {
      console.error('No payment intent in charge')
      return
    }

    // Try to find order by payment intent ID
    let order = await Order.findOne({ stripePaymentIntentId: paymentIntentId })
    let updatingOrder = null

    if (!order) {
      // Try to find updating order
      updatingOrder = await UpdateOrder.findOne({ stripePaymentIntentId: paymentIntentId })
    }

    if (!order && !updatingOrder) {
      console.error(`Order not found for payment intent: ${paymentIntentId}`)
      return
    }

    if (order) {
      // Handle regular order refund
      order.paymentStatus = 'refunded'
      order.status = 'cancelled'
      await order.save()
      console.log(`Regular order ${order.orderId} payment refunded`)
    } else if (updatingOrder) {
      // Handle updating order refund
      updatingOrder.paymentStatus = 'refunded'
      updatingOrder.status = 'cancelled'
      await updatingOrder.save()
      console.log(`Updating order ${updatingOrder._id} payment refunded`)
    }
  } catch (error) {
    console.error('Error handling payment refund:', error)
  }
}
