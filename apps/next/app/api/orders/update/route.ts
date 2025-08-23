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
      | { updatingOrderId: string; paymentMethod?: string }

    // New flow: apply UpdateOrder by id
    if ('updatingOrderId' in body && body.updatingOrderId) {
      const { updatingOrderId, paymentMethod = 'Credit Card' } = body

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

      // Merge each day from updatingOrder into original order with proper format matching
      for (const dayUpdate of updatingOrder.items || []) {
        const day = dayUpdate.day

        // Get food details with full food object for original order format
        const newItems = []
        for (const item of dayUpdate.items || []) {
          const food = await FoodItem.findById(item.food)
          if (food) {
            // Create food object in the same format as original order
            const foodCopy = {
              _id: food._id,
              name: food.name,
              short_description: food.short_description,
              description: food.description,
              price: food.price,
              category: food.category,
              veg: food.veg,
              available: food.available,
              public_id: food.public_id,
              url: food.url,
              createdAt: food.createdAt,
              updatedAt: food.updatedAt,
            }

            newItems.push({
              food: foodCopy,
              quantity: item.quantity,
              price: food.price,
            })
          }
        }

        const existingDayIndex = originalOrder.items.findIndex((d: any) => d.day === day)

        if (existingDayIndex !== -1) {
          // Existing day found - merge items and handle duplicates
          const existingItems = Array.isArray(originalOrder.items[existingDayIndex].items)
            ? originalOrder.items[existingDayIndex].items
            : []

          // Create a map to track existing food items by food ID
          const existingFoodMap = new Map()
          existingItems.forEach((item: any) => {
            const foodId = item.food._id?.toString() || item.food.toString()
            existingFoodMap.set(foodId, item)
          })

          // Merge new items with existing items
          for (const newItem of newItems) {
            const foodId = newItem.food._id.toString()
            const existingItem = existingFoodMap.get(foodId)

            if (existingItem) {
              // Food item already exists - increase quantity
              existingItem.quantity += newItem.quantity
              // Update price if needed (use the higher price or latest price)
              existingItem.price = Math.max(existingItem.price, newItem.price)
            } else {
              // New food item - add to existing items
              existingItems.push(newItem)
            }
          }

          // Calculate day total
          const dayTotal = existingItems.reduce(
            (acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 0),
            0
          )

          originalOrder.items[existingDayIndex] = {
            ...originalOrder.items[existingDayIndex].toObject?.() /* mongoose doc safe */,
            items: existingItems,
            dayTotal,
            deliveryDate:
              originalOrder.items[existingDayIndex].deliveryDate || dayUpdate.deliveryDate,
          }
        } else {
          // New day - add all items
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

      // Update the updating order status to reflect successful payment
      updatingOrder.status = 'confirmed'
      updatingOrder.paymentStatus = 'paid'
      updatingOrder.paymentMethod = paymentMethod
      await updatingOrder.save()

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
      let foodDetailsMap = {} as Record<string, { price: number; _id: any; foodObject: any }>

      // Get food details from database
      for (const p of newProducts) {
        try {
          const food = await FoodItem.findOne({ name: p.name })
          if (food) {
            const foodObject = {
              _id: food._id,
              name: food.name,
              short_description: food.short_description,
              description: food.description,
              price: food.price,
              category: food.category,
              veg: food.veg,
              available: food.available,
              public_id: food.public_id,
              url: food.url,
              createdAt: food.createdAt,
              updatedAt: food.updatedAt,
            }
            foodDetailsMap[p.name] = { price: food.price, _id: food._id, foodObject }
          }
        } catch {}
      }

      const existingDayIndex = order.items.findIndex((item: any) => item.day === day)

      if (existingDayIndex !== -1) {
        // Get existing items, ensuring it's an array
        const existingItems = Array.isArray(order.items[existingDayIndex].items)
          ? order.items[existingDayIndex].items
          : []

        // Create a map to track existing food items by food ID
        const existingFoodMap = new Map()
        existingItems.forEach((item: any) => {
          const foodId = item.food._id?.toString() || item.food.toString()
          existingFoodMap.set(foodId, item)
        })

        // Add new items or merge with existing ones
        for (const product of newProducts) {
          const foodData = foodDetailsMap[product.name]
          if (foodData) {
            const price = foodData.price || product.price || 0
            const foodId = foodData._id.toString()
            const existingItem = existingFoodMap.get(foodId)

            if (existingItem) {
              // Food item already exists - increase quantity
              existingItem.quantity += product.quantity
              existingItem.price = Math.max(existingItem.price, price)
            } else {
              // New food item - add to existing items
              existingItems.push({
                food: foodData.foodObject,
                quantity: product.quantity,
                price,
              })
            }
          }
        }

        const dayTotal = existingItems.reduce(
          (acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 0),
          0
        )

        order.items[existingDayIndex] = {
          ...order.items[existingDayIndex].toObject?.(),
          items: existingItems,
          dayTotal,
        }
      } else {
        const newItems = newProducts
          .map((product) => {
            const foodData = foodDetailsMap[product.name]
            const price = foodData?.price || product.price || 0
            const foodObject = foodData?.foodObject || null

            return {
              food: foodObject,
              quantity: product.quantity,
              price,
            }
          })
          .filter((item) => item.food !== null)

        const dayTotal = newItems.reduce(
          (acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 0),
          0
        )

        order.items.push({
          day,
          deliveryDate: new Date(),
          items: newItems,
          dayTotal,
        })
      }
    }

    // Recalculate total
    const newSubtotal = order.items.reduce((acc: number, d: any) => acc + (d.dayTotal || 0), 0)
    const platformFee = order.platformFee || 0
    const deliveryFee = order.deliveryFee || 0
    const discountAmount = (order.discount && order.discount.amount) || 0
    const taxes = order.taxes || 0
    order.totalPaid = newSubtotal + platformFee + deliveryFee - discountAmount + taxes

    const saved = await order.save({ validateBeforeSave: false })

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      updatedTotal: order.totalPaid,
      orderItems: order.items,
      orderId: order._id?.toString?.(),
    })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    )
  }
}
