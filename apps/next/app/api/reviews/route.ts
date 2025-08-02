import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Review from 'models/Review'
import Order from 'models/Orders'
import { verifyAuth } from 'lib/verifyJwt'

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req)
  if (auth instanceof NextResponse) return auth
  const userId = auth.user.id

  const { order, rating, reviewText, selectedItems } = await req.json()
  if (!order || !rating || !reviewText) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  await connectToDatabase()
  const orderDoc = await Order.findById(order)
  if (!orderDoc || String(orderDoc.user) !== userId || orderDoc.status !== 'delivered') {
    return NextResponse.json({ success: false, error: 'Invalid order for review' }, { status: 403 })
  }

  const review = new Review({
    user: userId,
    order,
    rating,
    reviewText,
    selectedItems,
  })

  try {
    await review.save()
    return NextResponse.json({ success: true, message: 'Review submitted successfully' })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Duplicate or invalid review' },
      { status: 400 }
    )
  }
}
