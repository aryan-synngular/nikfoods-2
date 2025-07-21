import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import FoodCategory from 'models/FoodCategory'
import cloudinary from 'lib/cloudinary'
import mongoose from 'mongoose'

// --- GET all categories ---
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const totalCategories = await FoodCategory.countDocuments()

    const categories = await FoodCategory.find().sort({ createdAt: -1 })

    return NextResponse.json({
      items: categories,
      total: totalCategories,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// --- ADD a new category ---
export async function POST(req: NextRequest) {
  const data = await req.json()

  const { name, description, public_id, url } = data
  try {
    await connectToDatabase()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      NextResponse.json(
        { error: 'Name is required and must be a non-empty string.' },
        { status: 400 }
      )
    }
    if (description && typeof description !== 'string') {
      NextResponse.json({ error: 'Description must be a string.' }, { status: 400 })
    }

    const category = await FoodCategory.create({ name, description, url, public_id })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error(error)
    if (public_id) {
      try {
        await cloudinary.uploader.destroy(public_id)
        console.log(`Deleted image: ${public_id}`)
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', err)
      }
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 400 })
  }
}

// --- UPDATE a category by id ---
export async function PUT(req: NextRequest) {
  const data = await req.json()
  const { _id, public_id, url, isImageUpdated, ...update } = data
  try {
    console.log(data)
    await connectToDatabase()

    if (!_id) {
      return NextResponse.json({ error: 'Missing _id' }, { status: 400 })
    }
    const categoryExist = await FoodCategory.findById(_id)
    if (!categoryExist) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (isImageUpdated && categoryExist.public_id) {
      try {
        await cloudinary.uploader.destroy(categoryExist.public_id)
        console.log(`Deleted image: ${categoryExist.public_id}`)
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', err)
      }
    }

    const category = await FoodCategory.findByIdAndUpdate(
      _id,
      { ...update, url, public_id },
      { new: true }
    )

    return NextResponse.json(category)
  } catch (error) {
    console.error(error)
    if (public_id) {
      try {
        await cloudinary.uploader.destroy(public_id)
        console.log(`Deleted image: ${public_id}`)
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', err)
      }
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 400 })
  }
}

// --- DELETE a category by id ---
export async function DELETE(req: NextRequest) {
  let session: mongoose.ClientSession | null = null
  try {
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }
    session = await mongoose.startSession()
    session.startTransaction()
    const category = await FoodCategory.findById(id)
    if (category) {
      await FoodCategory.deleteOne({ _id: id }, { session })
      if (category.public_id) {
        const cloudinaryRes = await cloudinary.uploader.destroy(category.public_id)
        if (cloudinaryRes.result !== 'ok') {
          // Cloudinary deletion failed, rollback DB deletion
          throw new Error('Cloudinary deletion failed')
        }
      }
    }
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    await session.commitTransaction()
    session.endSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 400 })
  }
}
