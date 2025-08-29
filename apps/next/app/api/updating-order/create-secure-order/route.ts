import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import { verifyAuth } from 'lib/verifyJwt'
import UpdateOrder from 'models/UpdateOrder'
import Order from 'models/Orders'
import FoodItem from 'models/FoodItem'
import Zincode from 'models/Zincode'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Cart clubbing logic functions (copied from create API)
interface CartDay {
  day: string
  date: string
  items: any[]
  dayTotal: number
  deliveryDate?: string
  deliveryDay?: string
}

interface CartClubbingResult {
  canCheckout: boolean
  clubbedDays: CartDay[]
  deliveryMessages: string[]
  totalShortfall: number
}

function calculateCartClubbing(cartDays: CartDay[], minCartValue: number): CartClubbingResult {
  const result: CartClubbingResult = {
    canCheckout: false,
    clubbedDays: [],
    deliveryMessages: [],
    totalShortfall: 0
  }

  if (!cartDays.length) {
    return result
  }

  // Sort days by date
  const sortedDays = [...cartDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Calculate individual day totals
  const dayAnalysis = sortedDays.map((day, index) => {
    const dayTotal = day.items.reduce((sum, item) => sum + (item.food?.price || 0) * item.quantity, 0)
    const shortfall = Math.max(0, minCartValue - dayTotal)
    const meetsMinimum = dayTotal >= minCartValue
    
    return {
      ...day,
      dayTotal,
      shortfall,
      meetsMinimum,
      originalIndex: index
    }
  })

  // Check if any individual day meets minimum
  const daysMeetingMinimum = dayAnalysis.filter(day => day.meetsMinimum)
  
  if (daysMeetingMinimum.length > 0) {
    // At least one day meets minimum - can checkout
    result.canCheckout = true
    
    // Check for specific case: Friday meets minimum, Saturday doesn't meet minimum
    // In this case, club both to Saturday
    const hasFridaySaturdayScenario = dayAnalysis.length >= 2 && 
      dayAnalysis[0].day === 'Friday' && dayAnalysis[1].day === 'Saturday' &&
      dayAnalysis[0].meetsMinimum && !dayAnalysis[1].meetsMinimum
    
    if (hasFridaySaturdayScenario) {
      // Special case: Club both Friday and Saturday to Saturday
      dayAnalysis.forEach((day) => {
        result.clubbedDays.push({
          ...day,
          deliveryDate: dayAnalysis[1].date, // Saturday's date
          deliveryDay: dayAnalysis[1].day    // Saturday
        })
        
        if (day.meetsMinimum && day.day === 'Friday') {
          // Friday meets minimum but is being clubbed to Saturday
          result.deliveryMessages.push(`Min. order value met, your '${day.day}' order will be delivered on '${dayAnalysis[1].day}'`)
        } else if (day.day === 'Saturday') {
          // Saturday - delivery is on Saturday (same day)
          result.deliveryMessages.push(`Min. order value met, your '${day.day}' order will be delivered the same day.`)
        }
      })
    } else {
      // Process each day individually (original logic)
      dayAnalysis.forEach((day) => {
        if (day.meetsMinimum) {
          // Day meets minimum - same day delivery
          result.clubbedDays.push({
            ...day,
            deliveryDate: day.date,
            deliveryDay: day.day
          })
          
          result.deliveryMessages.push(`Min. order value met, your '${day.day}' order will be delivered the same day.`)
        } else {
          // Day doesn't meet minimum - check if it can be clubbed
          const canBeClubbed = checkIfCanBeClubbed(day, dayAnalysis, minCartValue)
          
          if (canBeClubbed) {
            // Can be clubbed - find the latest delivery day among clubbed days
            const latestDeliveryDay = findLatestDeliveryDay(day, dayAnalysis, minCartValue)
            
            result.clubbedDays.push({
              ...day,
              deliveryDate: latestDeliveryDay.date,
              deliveryDay: latestDeliveryDay.day
            })
            
            result.deliveryMessages.push(`Add $${day.shortfall.toFixed(2)} to your order for delivery on '${latestDeliveryDay.day}'`)
          } else {
            // Cannot be clubbed - show shortfall for original day
            result.clubbedDays.push({
              ...day,
              deliveryDate: day.date,
              deliveryDay: day.day
            })
            
            result.deliveryMessages.push(`Add $${day.shortfall.toFixed(2)} to your order for delivery on '${day.day}'`)
          }
        }
      })
    }
  } else {
    // No individual day meets minimum - check if clubbing works
    const totalCartValue = dayAnalysis.reduce((sum, day) => sum + day.dayTotal, 0)
    
    if (totalCartValue >= minCartValue) {
      // Can checkout with clubbing - all items go to the latest day
      result.canCheckout = true
      const latestDay = dayAnalysis[dayAnalysis.length - 1]
      
      dayAnalysis.forEach((day) => {
        result.clubbedDays.push({
          ...day,
          deliveryDate: latestDay.date,
          deliveryDay: latestDay.day
        })
        
        if (day.day !== latestDay.day) {
          result.deliveryMessages.push(`Add $${day.shortfall.toFixed(2)} to your order for delivery on '${day.day}'`)
        }
      })
      
      // Add the main clubbing message
      result.deliveryMessages.unshift(`Delivery dates revised for your order since one of the days min cart value not met. Can add $${dayAnalysis[0].shortfall.toFixed(2)} worth of items for '${dayAnalysis[0].day}' to get deliveries on respective days.`)
    } else {
      // Cannot checkout - total shortfall
      result.canCheckout = false
      result.totalShortfall = minCartValue - totalCartValue
      
      dayAnalysis.forEach((day) => {
        result.clubbedDays.push({
          ...day,
          deliveryDate: day.date,
          deliveryDay: day.day
        })
        
        result.deliveryMessages.push(`Add $${day.shortfall.toFixed(2)} to your order for delivery on '${day.day}'`)
      })
    }
  }

  return result
}

function checkIfCanBeClubbed(day: any, allDays: any[], minCartValue: number): boolean {
  // Check if combining with future days can meet minimum
  const futureDays = allDays.slice(day.originalIndex + 1)
  const combinedTotal = day.dayTotal + futureDays.reduce((sum, futureDay) => sum + futureDay.dayTotal, 0)
  
  return combinedTotal >= minCartValue
}

function findLatestDeliveryDay(day: any, allDays: any[], minCartValue: number): any {
  // Find the latest day that can be used for delivery
  const futureDays = allDays.slice(day.originalIndex + 1)
  
  // If any future day meets minimum individually, use the latest one
  const daysMeetingMinimum = futureDays.filter(d => d.meetsMinimum)
  if (daysMeetingMinimum.length > 0) {
    return daysMeetingMinimum[daysMeetingMinimum.length - 1]
  }
  
  // Otherwise, use the latest day in the sequence
  return allDays[allDays.length - 1]
}

export async function POST(req: NextRequest) {
  // ✅ Auth
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { id: userId } = authResult.user

  try {
    await connectToDatabase()

    const { updatingOrderId, currency = 'usd' } = await req.json()

    if (!updatingOrderId) {
      return NextResponse.json(
        { success: false, error: 'updatingOrderId is required' },
        { status: 400 }
      )
    }

    // Fetch updating order and populate original order
    const updatingOrder = await UpdateOrder.findById(updatingOrderId).populate({
      path: 'originalOrderId',
      model: Order,
    })

    if (!updatingOrder) {
      return NextResponse.json(
        { success: false, error: 'Updating order not found' },
        { status: 404 }
      )
    }

    // Ownership check through original order's user
    const originalOrder: any = updatingOrder.originalOrderId
    if (!originalOrder || String(originalOrder.user) !== String(userId)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    // ✅ Get minimum cart value from postal code
    const zincode = await Zincode.findOne({ zipcode: originalOrder.address.postal_code })
    const minCartValue = zincode?.minCartValue || 0

    // ✅ Separate original order items and updating order items for different purposes
    const originalOrderDays: CartDay[] = []
    const updatingOrderDays: CartDay[] = []
    let updatingOrderTotal = 0
    
    // Use the original order's totalPaid field instead of recalculating
    const originalOrderTotal = originalOrder.totalPaid || 0
    
    // Process original order items (for min cart value calculation only)
    if (originalOrder.items && originalOrder.items.length > 0) {
      for (const originalDay of originalOrder.items) {
        const dayItems = []
        let dayTotal = 0
        
        for (const item of originalDay.items) {
          const foodItem = item.food
          if (!foodItem) continue
          
          const itemTotal = foodItem.price * item.quantity
          dayTotal += itemTotal
          
          dayItems.push({
            food: {
              _id: foodItem._id,
              name: foodItem.name,
              price: foodItem.price,
              category: foodItem.category,
              veg: foodItem.veg,
              available: foodItem.available,
              url: foodItem.url,
            },
            quantity: item.quantity,
            price: foodItem.price,
          })
        }
        
        if (dayItems.length > 0) {
          originalOrderDays.push({
            day: originalDay.day,
            date: originalDay.deliveryDate,
            items: dayItems,
            dayTotal,
          })
        }
      }
    }
    
    // Process updating order items (this is what user will pay for)
    if (updatingOrder.items && updatingOrder.items.length > 0) {
      for (const updatingDay of updatingOrder.items) {
        const dayItems = []
        let dayTotal = 0
        
        for (const item of updatingDay.items) {
          const food = await FoodItem.findById(item.food)
          if (!food || !food.price) continue
          
          const itemTotal = food.price * item.quantity
          dayTotal += itemTotal
          
          dayItems.push({
            food: {
              _id: food._id,
              name: food.name,
              price: food.price,
              category: food.category,
              veg: food.veg,
              available: food.available,
              url: food.url,
            },
            quantity: item.quantity,
            price: food.price,
          })
        }
        
        if (dayItems.length > 0) {
          updatingOrderDays.push({
            day: updatingDay.day,
            date: updatingDay.deliveryDate,
            items: dayItems,
            dayTotal,
          })
          updatingOrderTotal += dayTotal
        }
      }
    }

    // ✅ Combine for min cart value calculation (but keep track of what's original vs updating)
    const combinedDays: CartDay[] = [...originalOrderDays, ...updatingOrderDays]

    if (combinedDays.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items in updating order' },
        { status: 400 }
      )
    }

    // ✅ Apply cart clubbing logic
    const clubbingResult = calculateCartClubbing(combinedDays, minCartValue)
    
    if (!clubbingResult.canCheckout) {
      return NextResponse.json({ 
        success: false, 
        error: `The minimum order price hasn't been reached yet. Add another $${clubbingResult.totalShortfall.toFixed(2)} to complete the order.`,
        deliveryMessages: clubbingResult.deliveryMessages,
        canCheckout: false,
        totalShortfall: clubbingResult.totalShortfall
      }, { status: 200 })
    }

    // ✅ Process clubbed items - Group by delivery day to avoid duplicates
    const validatedItems: any[] = []
    let totalSubtotal = 0
    
    // Group items by delivery day
    const deliveryDayGroups = new Map()
    
    for (const clubbedDay of clubbingResult.clubbedDays) {
      const deliveryKey = `${clubbedDay.deliveryDay}-${clubbedDay.deliveryDate}`
      
      if (!deliveryDayGroups.has(deliveryKey)) {
        deliveryDayGroups.set(deliveryKey, {
          day: clubbedDay.deliveryDay,
          deliveryDate: clubbedDay.deliveryDate,
          items: [],
          dayTotal: 0
        })
      }
      
      const deliveryGroup = deliveryDayGroups.get(deliveryKey)
      
      for (const cartItem of clubbedDay.items) {
        const foodItem = cartItem.food
        if (!foodItem) continue
        const itemTotal = foodItem.price * cartItem.quantity
        deliveryGroup.dayTotal += itemTotal

        deliveryGroup.items.push({
          food: {
            _id: foodItem._id,
            name: foodItem.name,
            price: foodItem.price,
            category: foodItem.category,
            veg: foodItem.veg,
            available: foodItem.available,
            url: foodItem.url,
          },
          quantity: cartItem.quantity,
          price: foodItem.price,
        })
      }
    }
    
    // Convert grouped items to validatedItems array
    deliveryDayGroups.forEach((deliveryGroup) => {
      if (deliveryGroup.items.length > 0) {
        validatedItems.push(deliveryGroup)
        totalSubtotal += deliveryGroup.dayTotal
      }
    })

    // ✅ Extract only the updated food items from clubbed result and save to UpdateOrder
    const clubbedUpdatedItems: any[] = []
    
    // Group clubbed items by delivery day and extract only updated items
    const clubbedUpdatedGroups = new Map()
    
    for (const clubbedDay of clubbingResult.clubbedDays) {
      const deliveryKey = `${clubbedDay.deliveryDay}-${clubbedDay.deliveryDate}`
      
      if (!clubbedUpdatedGroups.has(deliveryKey)) {
        clubbedUpdatedGroups.set(deliveryKey, {
          day: clubbedDay.deliveryDay,
          deliveryDate: clubbedDay.deliveryDate,
          items: [],
          dayTotal: 0
        })
      }
      
      const deliveryGroup = clubbedUpdatedGroups.get(deliveryKey)
      
      // Only include items that are from the updating order (not original order)
      for (const cartItem of clubbedDay.items) {
        const foodItem = cartItem.food
        if (!foodItem) continue
        
        // Check if this item is from the updating order by comparing with updatingOrderDays
        const isFromUpdatingOrder = updatingOrderDays.some(updatingDay => 
          updatingDay.items.some(updatingItem => 
            updatingItem.food._id === foodItem._id && updatingItem.quantity === cartItem.quantity
          )
        )
        
        if (isFromUpdatingOrder) {
          const itemTotal = foodItem.price * cartItem.quantity
          deliveryGroup.dayTotal += itemTotal

          deliveryGroup.items.push({
            food: {
              _id: foodItem._id,
              name: foodItem.name,
              price: foodItem.price,
              category: foodItem.category,
              veg: foodItem.veg,
              available: foodItem.available,
              url: foodItem.url,
            },
            quantity: cartItem.quantity,
            price: foodItem.price,
          })
        }
      }
    }
    
    // Convert to final format for UpdateOrder model
    clubbedUpdatedGroups.forEach((deliveryGroup) => {
      if (deliveryGroup.items.length > 0) {
        clubbedUpdatedItems.push({
          day: deliveryGroup.day,
          deliveryDate: deliveryGroup.deliveryDate,
          items: deliveryGroup.items.map((item: any) => ({
            food: {
              _id: item.food._id,
              name: item.food.name,
              price: item.food.price,
              category: item.food.category,
              veg: item.food.veg,
              available: item.food.available,
              url: item.food.url,
            },
            quantity: item.quantity,
            price: item.food.price,
          })),
          dayTotal: deliveryGroup.dayTotal,
        })
      }
    })

    // ✅ Update the UpdateOrder with clubbed items in reaarrangedItems field
    updatingOrder.reaarrangedItems = clubbedUpdatedItems
    await updatingOrder.save()

    // ✅ Calculate payment amount - user only pays for updating order items
    // For update orders, no service fees - just the food items total
    const updatingOrderSubtotal = updatingOrderTotal
    const totalAmount = updatingOrderSubtotal

    if (!clubbedUpdatedItems.length) {
      return NextResponse.json({ success: false, error: 'No valid items in order' }, { status: 400 })
    }

    // Create rearranged cart structure for frontend display (using clubbed updated items)
    const cartDisplayGroups = new Map()
    
    clubbedUpdatedItems.forEach((clubbedDay) => {
      const key = `${clubbedDay.day}-${clubbedDay.deliveryDate}`
      
      if (!cartDisplayGroups.has(key)) {
        cartDisplayGroups.set(key, {
          _id: `clubbed-${clubbedDay.day}-${clubbedDay.deliveryDate}`,
          day: clubbedDay.day,
          date: clubbedDay.deliveryDate,
          cart_value: clubbedDay.dayTotal,
          items: clubbedDay.items.map((item: any) => ({
            _id: `clubbed-${item.food._id}`,
            food: item.food,
            quantity: item.quantity,
            day: clubbedDay.day
          }))
        })
      }
    })
    
    const rearrangedCart = {
      days: Array.from(cartDisplayGroups.values())
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency,
      metadata: {
        updatingOrderId: updatingOrder._id.toString(),
        orderId: originalOrder._id.toString(),
        userId,
        orderType:"UPDATE"
      },
      description: `Order Update ${updatingOrder._id} - NikFoods`,
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: updatingOrder._id.toString(),
        originalOrderId: originalOrder.orderId.toString(),
        totalAmount: totalAmount.toFixed(2),
        currency,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        rearrangedCart: rearrangedCart, // Send rearranged cart structure
        // Payment breakdown information
        originalOrderTotal: originalOrderTotal.toFixed(2),
        updatingOrderTotal: updatingOrderTotal.toFixed(2),
        // Original order items for display
        originalOrderItems: originalOrder.items || [],
      },
      message: clubbingResult.deliveryMessages.length > 0 
        ? clubbingResult.deliveryMessages.join('. ') 
        : 'Secure updating order created successfully',
      deliveryMessages: clubbingResult.deliveryMessages,
    })
  } catch (error: any) {
    console.error('Error creating secure updating order:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create secure updating order' },
      { status: 500 }
    )
  }
}
