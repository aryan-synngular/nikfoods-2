// app/api/orders/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import { verifyAuth, decodeAccessToken } from 'lib/verifyJwt'
import Stripe from 'stripe'
import { serverEnv } from '../../../../data/env/server'
import FoodItem from 'models/FoodItem'
import Cart from 'models/Cart'
import Address from 'models/Address'
import CartItem from 'models/CartItem'
import Zincode from 'models/Zincode'

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

// Cart clubbing logic functions
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

// Helper function to validate delivery time restrictions
function validateDeliveryTime(clubbedDays: any[]): { isValid: boolean; error?: string } {
  const now = new Date()
  const currentHour = now.getHours()
  
  // Check if any delivery is scheduled for today
  const hasTodayDelivery = clubbedDays.some((day) => {
    if (!day.deliveryDate) return false
    const deliveryDate = new Date(day.deliveryDate)
    const today = new Date()
    return deliveryDate.toDateString() === today.toDateString()
  })
  
  // If today is a delivery day and it's past 1 PM, reject the order
  if (hasTodayDelivery && currentHour >= 13) {
    return {
      isValid: false,
      error: 'Orders for today\'s delivery can only be placed before 1 PM. Please select a future delivery date.'
    }
  }
  
  // Check if any delivery is in the past
  const hasPastDelivery = clubbedDays.some((day) => {
    if (!day.deliveryDate) return false
    const deliveryDate = new Date(day.deliveryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    deliveryDate.setHours(0, 0, 0, 0) // Reset time to start of day
    return deliveryDate < today
  })
  
  if (hasPastDelivery) {
    return {
      isValid: false,
      error: 'Cannot place orders for past delivery dates. Please select today or future delivery dates.'
    }
  }
  
  return { isValid: true }
}

export async function POST(req: NextRequest) {
  // ✅ Auth
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  let userId: string | null = null
  if (token) {
    try {
      const user = decodeAccessToken(token)
      userId = user.id
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  } else {
    const authResult = await verifyAuth(req)
    if (authResult instanceof NextResponse) return authResult
    userId = authResult.user.id
  }

  try {
    await connectToDatabase()

    const body = await req.json()
    const { deliveryAddress, currency = 'usd' } = body

    // ✅ Fetch user cart
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const userCart = await Cart.findOne({ user: userId }).populate({
      path: 'days',
      match: { date: { $gte: today } },
      populate: {
        path: 'items',
        model: CartItem,
        populate: {
          path: 'food',
          model: FoodItem,
        },
      },
    }).populate({
      path: 'selectedAddress',
    })

    if (!userCart || !userCart.days?.length) {
      return NextResponse.json({ success: false, error: 'Cart empty' }, { status: 400 })
    }

    // ✅ Fetch delivery address
    // const addressDetails = await Address.findById(deliveryAddress)
    if (!userCart.selectedAddress) {
      return NextResponse.json({ success: false, error: 'Delivery address not found' }, { status: 400 })
    }

    // ✅ Get minimum cart value from postal code
    const zincode = await Zincode.findOne({ zipcode: userCart.selectedAddress.postal_code })
    const minCartValue = zincode?.minCartValue || 0
    const now = new Date()
    const addressDetails = userCart.selectedAddress         
    // ✅ Filter items based on delivery time restrictions
    const filteredDays = userCart.days.map((day: any) => {
      const filteredItems = day.items.filter((item: any) => {
        if (day.date) {
          const cartDayDate = new Date(day.date)
          const isToday =
            cartDayDate.getFullYear() === now.getFullYear() &&
            cartDayDate.getMonth() === now.getMonth() &&
            cartDayDate.getDate() === now.getDate()

          if (isToday) {
            return now.getHours() < 13 // only before 1 PM
          }
        }
        return true // keep all other days' items
      })

      return {
        day: day.day,
        date: day.date,
        items: filteredItems,
        dayTotal: filteredItems.reduce((sum: number, item: any) => sum + (item.food?.price || 0) * item.quantity, 0)
      }
    })

    // Filter out days with no items
    const daysWithItems = filteredDays.filter((day: any) => day.items.length > 0)

    if (daysWithItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid items found in cart after time validation. Orders for today can only be placed before 1 PM.'
      }, { status: 400 })
    }

    // ✅ Validate food items before clubbing
    const validationErrors: string[] = []
    const validatedCartDays = daysWithItems.map((day: any) => {
      const validatedItems = day.items.filter((item: any) => {
        const food = item.food
        
        // Check if food item exists
        if (!food) {
          validationErrors.push(`Food item not found for item in ${day.day}`)
          return false
        }
        
        // Check if food item has required fields
        if (!food.name || !food._id) {
          validationErrors.push(`Invalid food item data for item in ${day.day}`)
          return false
        }
        
        // Check if food item is available
        if (food.available === false) {
          validationErrors.push(`${food.name} is currently unavailable`)
          return false
        }
        
        // Check if quantity is valid
        if (!item.quantity || item.quantity <= 0) {
          validationErrors.push(`Invalid quantity for ${food.name}`)
          return false
        }
        
        // Check if price is valid
        if (!food.price || food.price <= 0) {
          validationErrors.push(`Invalid price for ${food.name}`)
          return false
        }
        
        // Check if food item is not deleted (if there's a deleted field)
        if (food.deleted === true) {
          validationErrors.push(`${food.name} has been removed from the menu`)
          return false
        }
        
        return true
      })
      
      return {
        day: day.day,
        date: day.date,
        items: validatedItems,
        dayTotal: validatedItems.reduce((sum: number, item: any) => sum + (item.food?.price || 0) * item.quantity, 0)
      }
    })
    
    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Food item validation failed: ${validationErrors.join(', ')}`,
        validationErrors
      }, { status: 400 })
    }
    
    // Check if any days have items after validation
    const finalDaysWithItems = validatedCartDays.filter((day: any) => day.items.length > 0)
    if (finalDaysWithItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid food items found in cart after validation'
      }, { status: 400 })
    }
    
    // ✅ Prepare cart days data for clubbing calculation
    const cartDaysData = finalDaysWithItems

    // ✅ Apply cart clubbing logic
    const clubbingResult = calculateCartClubbing(cartDaysData, minCartValue)
    
    if (!clubbingResult.canCheckout) {
      return NextResponse.json({ 
        success: false, 
        error: `The minimum order price hasn't been reached yet. Add another $${clubbingResult.totalShortfall.toFixed(2)} to complete the order.`,
        deliveryMessages: clubbingResult.deliveryMessages,
        canCheckout: false,
        totalShortfall: clubbingResult.totalShortfall
      }, { status: 200 }) // Changed from 400 to 200 to not throw error
    }

    // ✅ Delivery time validation already done during filtering

    // ✅ Process clubbed items
    const validatedItems: any[] = []
    let totalSubtotal = 0

    for (const clubbedDay of clubbingResult.clubbedDays) {
      const dayItems = []
      let dayTotal = 0

      for (const cartItem of clubbedDay.items) {
        const foodItem = cartItem.food
        if (!foodItem) continue
        const itemTotal = foodItem.price * cartItem.quantity
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
          quantity: cartItem.quantity,
          price: foodItem.price,
        })
      }

      if (dayItems.length) {
        validatedItems.push({
          day: clubbedDay.deliveryDay,
          deliveryDate: clubbedDay.deliveryDate,
          items: dayItems,
          dayTotal,
        })
        totalSubtotal += dayTotal
      }
    }

    if (!validatedItems.length) {
      return NextResponse.json({ success: false, error: 'No valid items in cart' }, { status: 400 })
    }

    // Create rearranged cart structure for frontend display
    // Group items by delivery day to avoid duplicates
    const groupedByDeliveryDay = new Map()
    
    clubbingResult.clubbedDays.forEach((clubbedDay) => {
      const key = `${clubbedDay.deliveryDay}-${clubbedDay.deliveryDate}`
      
      if (!groupedByDeliveryDay.has(key)) {
        groupedByDeliveryDay.set(key, {
          _id: `clubbed-${clubbedDay.deliveryDay}-${clubbedDay.deliveryDate}`,
          day: clubbedDay.deliveryDay,
          date: clubbedDay.deliveryDate,
          cart_value: 0,
          items: []
        })
      }
      
      const existingDay = groupedByDeliveryDay.get(key)
      existingDay.cart_value += clubbedDay.dayTotal
      existingDay.items.push(...clubbedDay.items.map((item) => ({
        _id: `clubbed-${item.food._id}`,
        food: item.food,
        quantity: item.quantity,
        day: clubbedDay.deliveryDay
      })))
    })
    
    const rearrangedCart = {
      days: Array.from(groupedByDeliveryDay.values())
    }

    const platformFee = 1.0
    const deliveryFee = 10.0
    const discountAmount = totalSubtotal > 100 ? 10.0 : 5.0
    const taxes = totalSubtotal * 0.1
    const totalAmount = totalSubtotal + platformFee + deliveryFee - discountAmount + taxes

    // ✅ STEP 1: Check existing pending order for this user
    let order = await Order.findOne({ user: userId, status: 'pending', paymentStatus: 'unpaid' })
    if (order) {
      const intent=await stripe.paymentIntents.retrieve(order.stripePaymentIntentId)
      console.log(intent)
      
      console.log("EXISTING ORDER")
      console.log(order)
      // --- Update order snapshot + totals ---
      order.items = validatedItems
      order.totalPaid = totalAmount
      order.platformFee = platformFee
      order.deliveryFee = deliveryFee
      order.discount = { amount: discountAmount, code: 'TRYNEW' }
      order.taxes = taxes
      order.address = addressDetails
      
      // Add delivery messages if items were clubbed
      if (clubbingResult.deliveryMessages.length > 0) {
        order.deliveryMessages = clubbingResult.deliveryMessages
      }

      await order.save()
if (['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing'].includes(intent.status)) {
  console.log("INTENT PENDING")
    await stripe.paymentIntents.update(order.stripePaymentIntentId, {
      amount: Math.round(totalAmount * 100),
      currency,
      metadata: { orderId: order.orderId, userId,orderType:"NEW" },
      description: `Order ${order.orderId} - NikFoods`,
    })
  } 
  // --- CASE 2: Intent already finished, create a new one ---
  else {
  console.log("INTENT NEW")

    const newIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency,
      metadata: { orderId: order.orderId, userId,orderType:"NEW" },
      description: `Order ${order.orderId} - NikFoods`,
    })
    order.stripePaymentIntentId = newIntent.id
  }

    } else {

      console.log("New ORDER")
      console.log(order)
      // ✅ STEP 2: No pending order → create new
      order = new Order({
        user: userId,
        address: addressDetails,
        items: validatedItems,
        totalPaid: totalAmount,
        currency,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: 'Credit Card',
        platformFee,
        deliveryFee,
        discount: { amount: discountAmount, code: 'TRYNEW' },
        taxes,
        deliveryMessages: clubbingResult.deliveryMessages,
        rearrangedCart: rearrangedCart, // Store rearranged cart in order
      })

      await order.save()

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency,
        // automatic_payment_methods: { enabled: true },
        metadata: { orderId: order.orderId, userId,orderType:"NEW" },
        description: `Order ${order.orderId} - NikFoods`,
      })

      order.stripePaymentIntentId = paymentIntent.id
      await order.save()
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId,
        _id: order._id.toString(),
        totalAmount: totalAmount.toFixed(2),
        currency,
        clientSecret: order.stripePaymentIntentId
          ? (await stripe.paymentIntents.retrieve(order.stripePaymentIntentId)).client_secret
          : null,
        paymentIntentId: order.stripePaymentIntentId,
        rearrangedCart: rearrangedCart, // Send rearranged cart structure
      },
      message: clubbingResult.deliveryMessages.length > 0 
        ? clubbingResult.deliveryMessages.join('. ') 
        : 'Order created successfully',
      deliveryMessages: clubbingResult.deliveryMessages,
    })
  } catch (error: any) {
    console.error('Error creating/updating order:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
