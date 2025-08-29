import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Cart from 'models/Cart'
import { verifyAuth, decodeAccessToken } from 'lib/verifyJwt'
import CartItem from 'models/CartItem'
import FoodItem from 'models/FoodItem'

export async function GET(req: NextRequest) {
  let userId: string | null = null
  const authResult = await verifyAuth(req)

  if (authResult instanceof NextResponse) {
    return authResult
  }
  userId = authResult.user.id

  try {
    await connectToDatabase()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let cart = await Cart.findOne({ user: userId }).populate([
      {
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
      },
      {
        path: 'selectedAddress',
      }
    ])

    console.log('Cart fetched:', cart)
    if (!cart) {
      cart = await Cart.create({ user: userId, days: [] })
      // return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    // Filter items in each day just like in your second API
    const now = new Date()
    console.log('Cart days before filtering:', cart.days)
    const filteredDays = cart.days.map((day: any) => {
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
        ...day.toObject(),
        items: filteredItems,
      }
    })

    const newfilteredDays = filteredDays.filter((day: any) => day.items.length > 0)

    console.log('Filtered days:', newfilteredDays)

    // Sort days in general order: Monday to Saturday
    const weekOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const sortedDays = [...newfilteredDays].sort(
      (a: any, b: any) => weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day)
    )

    return NextResponse.json(
      { message: 'Cart fetched successfully', data: { ...cart.toObject(), days: sortedDays } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to fetch cart', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}
