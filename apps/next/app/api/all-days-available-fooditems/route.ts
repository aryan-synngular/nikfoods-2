import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import { verifyAuth } from 'lib/verifyJwt'
import AllDaysAvailable from 'models/AllDaysAvailable'
import FoodItem from 'models/FoodItem'
import FoodCategory from 'models/FoodCategory'

// GET - Fetch all days available food items
export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) return authResult

  try {
    await connectToDatabase()

    // Get the single AllDaysAvailable document
    let allDaysAvailable = await AllDaysAvailable.findOne()

    // If no document exists, create one with empty structure
    if (!allDaysAvailable) {
      allDaysAvailable = await AllDaysAvailable.create({
        foodItems: []
      })
    }

    return NextResponse.json({
      data: allDaysAvailable,
      message: 'All days available food items fetched successfully'
    })
  } catch (error) {
    console.error('Error fetching all days available food items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch all days available food items' },
      { status: 500 }
    )
  }
}

// PUT - Update all days available food items
export async function PUT(req: NextRequest) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) return authResult

  try {
    await connectToDatabase()

    const { foodItems } = await req.json()

    // Validate the data structure
    if (!Array.isArray(foodItems)) {
      return NextResponse.json(
        { error: 'Invalid data structure. foodItems must be an array.' },
        { status: 400 }
      )
    }

    // Get or create the single AllDaysAvailable document
    let allDaysAvailable = await AllDaysAvailable.findOne()

    if (!allDaysAvailable) {
      // Create new document
      allDaysAvailable = await AllDaysAvailable.create({
        foodItems: foodItems
      })
    } else {
      // Update existing document
      allDaysAvailable.foodItems = foodItems
      await allDaysAvailable.save()
    }

    return NextResponse.json({
      data: allDaysAvailable,
      message: 'All days available food items updated successfully'
    })
  } catch (error) {
    console.error('Error updating all days available food items:', error)
    return NextResponse.json(
      { error: 'Failed to update all days available food items' },
      { status: 500 }
    )
  }
}
