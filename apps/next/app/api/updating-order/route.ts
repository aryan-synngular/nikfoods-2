import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import { verifyAuth } from 'lib/verifyJwt'
import UpdateOrder from 'models/UpdateOrder'
import Order from 'models/Orders'
import FoodItem from 'models/FoodItem'

// Expected request body:
// {
//   orderId: string, // can be ObjectId or formatted orderId string (e.g., #ORD-...)
//   cartItems: { [day: string]: { [foodId: string]: number } }
// }

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) return authResult

  const { id: userId } = authResult.user

  try {
    await connectToDatabase()

    const { orderId, cartItems } = (await req.json()) as {
      orderId: string
      cartItems: Record<string, Record<string, number>>
    }

    if (!orderId || !cartItems || typeof cartItems !== 'object') {
      return NextResponse.json(
        { success: false, error: 'orderId and cartItems are required' },
        { status: 400 }
      )
    }

    // Resolve original order for this user
    let originalOrder: any = null

    // Try matching by Mongo ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(orderId)) {
      originalOrder = await Order.findOne({ _id: orderId, user: userId })
    }

    // Fallback to matching by formatted orderId string
    if (!originalOrder) {
      originalOrder = await Order.findOne({ orderId, user: userId })
    }

    if (!originalOrder) {
      return NextResponse.json(
        { success: false, error: 'Original order not found or unauthorized' },
        { status: 404 }
      )
    }

    // Helper: compute current week's date for a given weekday (Mon-based week)
    const dayIndexMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    }

    const getCurrentWeekDateFor = (dayName: string): Date => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const nowDay = today.getDay()
      const monday = new Date(today)
      const diffToMonday = (nowDay + 6) % 7 // 0 if Monday, 6 if Sunday
      monday.setDate(monday.getDate() - diffToMonday)

      const targetIndex = dayIndexMap[dayName] ?? 1 // default to Monday if unknown
      const offsetFromMonday = (targetIndex + 6) % 7 // Mon->0, Tue->1, ..., Sun->6

      const result = new Date(monday)
      result.setDate(monday.getDate() + offsetFromMonday)
      result.setHours(0, 0, 0, 0)
      return result
    }

    // Build UpdateOrder items array without price calculations
    const updatingOrderDays: Array<{
      day: string
      deliveryDate: Date
      items: Array<{ food: any; quantity: number }>
    }> = []

    for (const [day, dayCart] of Object.entries(cartItems)) {
      // Skip empty days
      if (!dayCart || Object.keys(dayCart).length === 0) continue

      const items: Array<{ food: any; quantity: number }> = []

      for (const [foodId, quantity] of Object.entries(dayCart)) {
        if (!quantity || quantity <= 0) continue

        const food = await FoodItem.findById(foodId)
        if (!food) continue

        items.push({ food: food._id, quantity })
      }

      // If no valid items for the day, skip
      if (items.length === 0) continue

      // Set deliveryDate as current week's respective day's date
      const deliveryDate = getCurrentWeekDateFor(day)

      updatingOrderDays.push({
        day,
        deliveryDate,
        items,
      })
    }

    if (updatingOrderDays.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid items to update' },
        { status: 400 }
      )
    }

    const created = await UpdateOrder.create({
      originalOrderId: originalOrder._id,
      items: updatingOrderDays,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'Credit Card',
    })

    return NextResponse.json({
      success: true,
      data: {
        updatingOrder: created,
        originalOrder,
      },
      message: 'Updating order created successfully',
    })
  } catch (error: any) {
    console.error('Error creating updating order:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create updating order' },
      { status: 500 }
    )
  }
}
