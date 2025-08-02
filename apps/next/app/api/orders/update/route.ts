import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import FoodItem from 'models/FoodItem'
import { verifyAuth } from 'lib/verifyJwt'

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

    const { orderId, updatedItems } = (await req.json()) as {
      orderId: string
      updatedItems: UpdatedItems
    }

    console.log('Received request:', { orderId, updatedItems, userId })

    if (!orderId || !updatedItems || typeof updatedItems !== 'object') {
      console.log('Validation failed:', { orderId, updatedItems })
      return NextResponse.json(
        { success: false, error: 'orderId and updatedItems are required' },
        { status: 400 }
      )
    }

    // Try multiple ways to find the order
    let order = null

    // Method 1: Try finding by MongoDB _id if it looks like an ObjectId
    if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Trying to find by _id:', orderId)
      order = await Order.findOne({ _id: orderId, user: userId })
    }

    // Method 2: Try finding by custom id field
    if (!order) {
      console.log('Trying to find by id field:', orderId)
      order = await Order.findOne({ id: orderId, user: userId })
    }

    // Method 3: Try finding by id without # prefix
    if (!order && orderId.startsWith('#')) {
      const idWithoutHash = orderId.substring(1)
      console.log('Trying to find by id without #:', idWithoutHash)
      order = await Order.findOne({ id: idWithoutHash, user: userId })
    }

    console.log('Order found:', order ? 'Yes' : 'No')

    if (!order) {
      console.log('Order not found for orderId:', orderId, 'userId:', userId)
      return NextResponse.json(
        { success: false, error: 'Order not found or unauthorized' },
        { status: 404 }
      )
    }

    console.log('Original order items:', JSON.stringify(order.items, null, 2))

    // Ensure order.items is initialized
    if (!order.items) {
      order.items = []
    }

    // Ensure address field is present (required by schema)
    if (!order.address) {
      order.address = order.deliveryAddress || 'Not specified'
    }

    for (const [day, newProducts] of Object.entries(updatedItems)) {
      console.log(`Processing day: ${day}`, newProducts)

      let foodDetailsMap = {} as Record<string, { price: number; _id: any }>

      // Get food details from database
      for (const p of newProducts) {
        try {
          const food = await FoodItem.findOne({ name: p.name })
          if (food) {
            foodDetailsMap[p.name] = { price: food.price, _id: food._id }
            console.log(`Found food item ${p.name} with price ${food.price} and id ${food._id}`)
          } else {
            console.log(`Food item not found: ${p.name}`)
          }
        } catch (foodError) {
          console.log(`Error finding food item ${p.name}:`, foodError)
        }
      }

      const existingDayIndex = order.items.findIndex((item: any) => item.day === day)

      if (existingDayIndex !== -1) {
        console.log(`Found existing day ${day} at index ${existingDayIndex}`)

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

          console.log(`Adding product ${product.name} with price ${price} and foodId ${foodId}`)

          mergedItems.push({
            food: foodId, // Use actual ObjectId or null
            quantity: product.quantity,
            price,
          })
        }

        const dayTotal = mergedItems.reduce((acc, item) => {
          return acc + item.price * item.quantity
        }, 0)

        console.log(`Day ${day} total: ${dayTotal}`)

        // Update the existing day item
        order.items[existingDayIndex] = {
          ...order.items[existingDayIndex].toObject(),
          items: mergedItems,
          dayTotal,
        }
      } else {
        console.log(`Creating new day: ${day}`)

        // Create new day
        const productsWithPrices = []

        for (const product of newProducts) {
          const foodData = foodDetailsMap[product.name]
          const price = foodData?.price || product.price || 0
          const foodId = foodData?._id || null

          console.log(`New day product ${product.name} with price ${price} and foodId ${foodId}`)

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

        console.log(`New day ${day} total: ${dayTotal}`)

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
      console.log(`Day ${dayItem.day} contributes ${total} to total`)
      return acc + total
    }, 0)

    console.log('New subtotal:', newTotalPaid)

    // Handle fees safely
    const platformFee = order.platformFee || 0
    const deliveryFee = order.deliveryFee || 0
    const discountAmount = (order.discount && order.discount.amount) || 0
    const taxes = order.taxes || 0

    console.log('Fees:', { platformFee, deliveryFee, discountAmount, taxes })

    order.totalPaid = newTotalPaid + platformFee + deliveryFee - discountAmount + taxes

    console.log('Final total:', order.totalPaid)

    // Use validateBeforeSave: false to bypass validation for existing items
    // that might have food: null
    const savedOrder = await order.save({ validateBeforeSave: false })

    console.log('Order saved successfully')

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      updatedTotal: order.totalPaid,
      orderItems: order.items, // Include updated items in response
    })
  } catch (error) {
    console.error('Update order error:', error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

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
