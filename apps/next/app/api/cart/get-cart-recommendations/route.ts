import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import FoodItem from 'models/FoodItem'
import mongoose from 'mongoose'
import FoodCategory from 'models/FoodCategory'
import { verifyAuth } from 'lib/verifyJwt'

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) {
    return authResult
  }
  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const dessert = await FoodCategory.findOne({ name: 'Dessert' })
    if (!dessert) {
      return NextResponse.json({ error: 'Dessert not found' }, { status: 400 })
    }

    const filter = {
      category: dessert._id,
    }

    const totalItems = await FoodItem.countDocuments(filter)

    const items = await FoodItem.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({
      data: {
        items,
        total: totalItems,
        page,
        pageSize: limit,
      },
      message: 'Recommendations fetched successfully',
    })
  } catch (error) {
    console.error('Error fetching Recommendations:', error)
    return NextResponse.json({ error: 'Failed to fetch Recommendations' }, { status: 500 })
  }
}
