import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import FoodItem from 'models/FoodItem'
import { verifyAuth } from 'lib/verifyJwt'
import UpdateOrder from 'models/UpdateOrder'

type UpdatedProduct = {
  name: string
  quantity: number
  price?: number
  totalPrice?: number
}

type UpdatedItems = Record<string, UpdatedProduct[]>

export async function PUT(req: NextRequest) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) return authResult

  const { id: userId } = authResult.user

  try {
    await connectToDatabase()

    const body = (await req.json()) as
      | { orderId: string; updatedItems: UpdatedItems }
      | { updatingOrderId: string }

    // New flow: apply UpdateOrder by id
    if ('updatingOrderId' in body && body.updatingOrderId) {
      const { updatingOrderId } = body

      // Load update request and original order
      const updatingOrder = await UpdateOrder.findById(updatingOrderId).populate('originalOrderId')
      if (!updatingOrder) {
        return NextResponse.json(
          { success: false, error: 'Updating order not found' },
          { status: 404 }
        )
      }

      const originalOrder: any = updatingOrder.originalOrderId
      if (!originalOrder) {
        return NextResponse.json(
          { success: false, error: 'Original order for updating request not found' },
          { status: 404 }
        )
      }

      if (String(originalOrder.user) !== String(userId)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      // Ensure structure
      if (!originalOrder.items) originalOrder.items = []
      if (!originalOrder.address)
        originalOrder.address = originalOrder.deliveryAddress || 'Not specified'

      // Merge each day from updatingOrder into original order
      for (const dayUpdate of updatingOrder.items || []) {
        const day = dayUpdate.day
        const newItems = (dayUpdate.items || []).map((it: any) => ({
          food: it.food,
          quantity: it.quantity,
          price: it.price,
        }))

        const existingDayIndex = originalOrder.items.findIndex((d: any) => d.day === day)

        if (existingDayIndex !== -1) {
          const existingItems = Array.isArray(originalOrder.items[existingDayIndex].items)
            ? originalOrder.items[existingDayIndex].items
            : []

          const mergedItems = [...existingItems, ...newItems]
          const dayTotal = mergedItems.reduce(
            (acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 0),
            0
          )

          originalOrder.items[existingDayIndex] = {
            ...originalOrder.items[existingDayIndex].toObject?.() /* mongoose doc safe */,
            items: mergedItems,
            dayTotal,
            deliveryDate:
              originalOrder.items[existingDayIndex].deliveryDate || dayUpdate.deliveryDate,
          }
        } else {
          const dayTotal = newItems.reduce(
            (acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 0),
            0
          )
          originalOrder.items.push({
            day,
            deliveryDate: dayUpdate.deliveryDate || new Date(),
            items: newItems,
            dayTotal,
          })
        }
      }

      // Recalculate totals
      const newSubtotal = originalOrder.items.reduce(
        (acc: number, d: any) => acc + (d.dayTotal || 0),
        0
      )
      const platformFee = originalOrder.platformFee || 0
      const deliveryFee = originalOrder.deliveryFee || 0
      const discountAmount = (originalOrder.discount && originalOrder.discount.amount) || 0
      const taxes = originalOrder.taxes || 0
      originalOrder.totalPaid = newSubtotal + platformFee + deliveryFee - discountAmount + taxes

      const saved = await originalOrder.save({ validateBeforeSave: false })

      return NextResponse.json({
        success: true,
        message: 'Order updated successfully',
        updatedTotal: originalOrder.totalPaid,
        orderItems: originalOrder.items,
        orderId: originalOrder._id?.toString?.(),
      })
    }

    // Legacy flow: update with provided items by name
    const { orderId, updatedItems } = body as { orderId: string; updatedItems: UpdatedItems }

    if (!orderId || !updatedItems || typeof updatedItems !== 'object') {
      return NextResponse.json(
        { success: false, error: 'orderId and updatedItems are required' },
        { status: 400 }
      )
    }

    // Try multiple ways to find the order
    let order = null as any

    // Method 1: Try finding by MongoDB _id if it looks like an ObjectId
    if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findOne({ _id: orderId, user: userId })
    }

    // Method 2: Try finding by custom id field
    if (!order) {
      order = await Order.findOne({ id: orderId, user: userId })
    }

    // Method 3: Try finding by id without # prefix
    if (!order && orderId.startsWith('#')) {
      const idWithoutHash = orderId.substring(1)
      order = await Order.findOne({ id: idWithoutHash, user: userId })
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found or unauthorized' },
        { status: 404 }
      )
    }

    // Ensure order.items is initialized
    if (!order.items) {
      order.items = []
    }

    // Ensure address field is present (required by schema)
    if (!order.address) {
      order.address = order.deliveryAddress || 'Not specified'
    }

    for (const [day, newProducts] of Object.entries(updatedItems)) {
      let foodDetailsMap = {} as Record<string, { price: number; _id: any }>

      // Get food details from database
      for (const p of newProducts) {
        try {
          const food = await FoodItem.findOne({ name: p.name })
          if (food) {
            foodDetailsMap[p.name] = { price: food.price, _id: food._id }
          }
        } catch {}
      }

      const existingDayIndex = order.items.findIndex((item: any) => item.day === day)

      if (existingDayIndex !== -1) {
        // Get existing items, ensuring it's an array
        const existingItems = Array.isArray(order.items[existingDayIndex].items)
          ? order.items[existingDayIndex].items
          : []

        const mergedItems = [...existingItems]

        // Add new items
        for (const product of newProducts) {
          const foodData = foodDetailsMap[product.name]
          const price = foodData?.price || product.price || 0
          const foodId = foodData?._id || null

          mergedItems.push({
            food: foodId, // Use actual ObjectId or null
            quantity: product.quantity,
            price,
          })
        }

        const dayTotal = mergedItems.reduce((acc, item) => {
          return acc + item.price * item.quantity
        }, 0)

        // Update the existing day item
        order.items[existingDayIndex] = {
          ...order.items[existingDayIndex].toObject(),
          items: mergedItems,
          dayTotal,
        }
      } else {
        // Create new day
        const productsWithPrices = [] as any[]

        for (const product of newProducts) {
          const foodData = foodDetailsMap[product.name]
          const price = foodData?.price || product.price || 0
          const foodId = foodData?._id || null

          productsWithPrices.push({
            food: foodId, // Use actual ObjectId or null
            quantity: product.quantity,
            price,
          })
        }

        const dayTotal = productsWithPrices.reduce(
          (acc: number, item: any) => acc + item.price * item.quantity,
          0
        )

        order.items.push({
          day,
          deliveryDate: new Date(),
          items: productsWithPrices,
          dayTotal,
        })
      }
    }

    // Calculate new total
    const newTotalPaid = order.items.reduce((acc: number, dayItem: any) => {
      const total = dayItem.dayTotal || 0
      return acc + total
    }, 0)

    // Handle fees safely
    const platformFee = order.platformFee || 0
    const deliveryFee = order.deliveryFee || 0
    const discountAmount = (order.discount && order.discount.amount) || 0
    const taxes = order.taxes || 0

    order.totalPaid = newTotalPaid + platformFee + deliveryFee - discountAmount + taxes

    // Use validateBeforeSave: false to bypass validation for existing items
    const savedOrder = await order.save({ validateBeforeSave: false })

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      updatedTotal: order.totalPaid,
      orderItems: order.items, // Include updated items in response
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
