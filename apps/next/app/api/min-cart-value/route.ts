import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Zincode from 'models/Zincode'
import { z } from 'zod'

const zincodeSchema = z.object({
  zipcode: z.string().min(1, 'Zipcode is required'),
  minCartValue: z.number().min(0, 'Min cart value must be non-negative'),
})

// --- GET all zincodes ---
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '7'

    const filter: any = {}
    if (search) {
      filter.zipcode = { $regex: search, $options: 'i' }
    }

    // Get total count without pagination
    const totalItems = await Zincode.countDocuments(filter)

    // Apply pagination
    const items = await Zincode.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 })

    return NextResponse.json({
      data: {
        items,
        total: totalItems,
        page: Number(page),
        pageSize: Number(limit),
      },
      message: 'Zincodes fetched successfully',
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to fetch zincodes' }, { status: 500 })
  }
}

// --- POST create new zincode ---
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const body = await req.json()

    const validatedData = zincodeSchema.parse(body)

    // Check if zipcode already exists
    const existingZincode = await Zincode.findOne({ zipcode: validatedData.zipcode })
    if (existingZincode) {
      return NextResponse.json({ error: 'Zipcode already exists' }, { status: 400 })
    }

    const zincode = await Zincode.create(validatedData)

    return NextResponse.json({
      data: zincode,
      message: 'Zincode created successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.log(error)
    return NextResponse.json({ error: 'Failed to create zincode' }, { status: 500 })
  }
}

// --- PUT update zincode ---
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const validatedData = zincodeSchema.parse(body)

    // Check if zipcode already exists for different document
    const existingZincode = await Zincode.findOne({ 
      zipcode: validatedData.zipcode,
      _id: { $ne: id }
    })
    if (existingZincode) {
      return NextResponse.json({ error: 'Zipcode already exists' }, { status: 400 })
    }

    const zincode = await Zincode.findByIdAndUpdate(id, validatedData, { new: true })

    if (!zincode) {
      return NextResponse.json({ error: 'Zincode not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: zincode,
      message: 'Zincode updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.log(error)
    return NextResponse.json({ error: 'Failed to update zincode' }, { status: 500 })
  }
}

// --- DELETE zincode ---
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const zincode = await Zincode.findByIdAndDelete(id)

    if (!zincode) {
      return NextResponse.json({ error: 'Zincode not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Zincode deleted successfully',
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to delete zincode' }, { status: 500 })
  }
}
