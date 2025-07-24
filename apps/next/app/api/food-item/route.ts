import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import FoodItem from 'models/FoodItem'
import { z } from 'zod'
import { connectToDatabase } from 'lib/db'
import cloudinary from 'lib/cloudinary'

const foodItemSchema = z.object({
  name: z.string().min(1, 'Name is required and must be a non-empty string.'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be a non-negative number.'),
  category: z.array(z.string(), { error: 'Category is required' }),
  veg: z.boolean({ error: 'Veg must be a boolean.' }),
  available: z.boolean({ error: 'Available must be a boolean.' }),
  public_id: z.string().optional(),
  url: z.string().optional(),
  isImageUpdated: z.boolean().optional(),
  _id: z.string().optional(),
})
// --- GET all food items ---
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    const filter: any = {
      name: { $regex: search, $options: 'i' },
    }

    if (category !== 'all') {
      filter.category = category
    }

    // ✅ Get total count without pagination
    const totalItems = await FoodItem.countDocuments(filter)

    // ✅ Apply pagination
    const items = await FoodItem.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('category')

    return NextResponse.json({
      items,
      total: totalItems,
      page: Number(page),
      pageSize: Number(limit),
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to fetch food items' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const jsonData = await req.json()
    let parsedData = foodItemSchema.parse(jsonData)
    const { name, description, price, category, veg, available, public_id, url } = parsedData
    console.log(parsedData)

    try {
      // Validate data using Zod

      await connectToDatabase()

      const item = await FoodItem.create({
        name,
        description,
        price,
        category,
        veg,
        available,
        url,
      })
      console.log(item)
      return NextResponse.json(item, { status: 201 })
    } catch (error) {
      console.log(error)
      if (public_id) {
        try {
          await cloudinary.uploader.destroy(public_id)
          console.log(`Deleted image: ${public_id}`)
        } catch (err) {
          console.error('Failed to delete image from Cloudinary:', err)
        }
      }
      return NextResponse.json({ error: 'Failed to add food item' }, { status: 400 })
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to add food item:' }, { status: 400 })
  }
}

// --- UPDATE a food item by id ---
export async function PUT(req: NextRequest) {
  try {
    const jsonData = await req.json()
    console.log(jsonData)
    let parsedData = foodItemSchema.parse(jsonData)
    const {
      _id,
      name,
      description,
      price,
      category,
      veg,
      available,
      isImageUpdated,
      public_id,
      url,
    } = parsedData
    console.log(parsedData)
    try {
      await connectToDatabase()
      if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 })
      const itemExist = await FoodItem.findById(_id)
      if (!itemExist) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (isImageUpdated && itemExist.public_id) {
        try {
          const cloudinaryRes = await cloudinary.uploader.destroy(itemExist.public_id)
          if (cloudinaryRes.result !== 'ok') {
            // Cloudinary deletion failed, rollback DB deletion
            throw new Error('Cloudinary deletion failed')
          }
          console.log(`Deleted image: ${itemExist.public_id}`)
        } catch (err) {
          console.error('Failed to delete image from Cloudinary:', err)
        }
      }

      const item = await FoodItem.findByIdAndUpdate(
        _id,
        { name, description, price, category, veg, available, url, public_id },
        { new: true }
      )

      return NextResponse.json(item)
    } catch (error) {
      console.log(error)

      if (isImageUpdated && public_id) {
        try {
          await cloudinary.uploader.destroy(public_id)
          console.log(`Deleted image: ${public_id}`)
        } catch (err) {
          console.error('Failed to delete image from Cloudinary:', err)
        }
      }
      return NextResponse.json({ error: 'Failed to update food item' }, { status: 400 })
    }
  } catch (error) {
    console.log(error)

    return NextResponse.json({ error: 'Failed to update food item' }, { status: 400 })
  }
}

// --- DELETE a food item by id (expects id in query string) ---
export async function DELETE(req: NextRequest) {
  let session: mongoose.ClientSession | null = null

  try {
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    session = await mongoose.startSession()
    session.startTransaction()
    const item = await FoodItem.findById(id)
    if (item) {
      await FoodItem.deleteOne({ _id: id }, { session })
      if (item.public_id) {
        const cloudinaryRes = await cloudinary.uploader.destroy(item.public_id)
        if (cloudinaryRes.result !== 'ok') {
          // Cloudinary deletion failed, rollback DB deletion
          throw new Error('Cloudinary deletion failed')
        }
      }
    }
    if (!item) {
      return NextResponse.json({ error: 'Food Item not found' }, { status: 404 })
    }
    await session.commitTransaction()
    session.endSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    return NextResponse.json({ error: 'Failed to delete food item' }, { status: 400 })
  }
}
