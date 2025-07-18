import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import FoodItem from 'models/FoodItem';
import { connectToDatabase } from 'lib/db';


// --- GET all food items ---
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
     const filter: any = {
      name: { $regex: search, $options: 'i' }
    };

    if (category !== 'all') {
      filter.category = { $regex: category, $options: 'i' };
    }

    // ✅ Get total count without pagination
    const totalItems = await FoodItem.countDocuments(filter);

    // ✅ Apply pagination
    const items = await FoodItem.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return NextResponse.json({
      items,
      total: totalItems,
      page: Number(page),
      pageSize: Number(limit)
    });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to fetch food items' }, { status: 500 });
  }
}

// --- ADD a new food item ---
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    // Input validation
    const { name, description, price, category, veg, available } = data;
    const errors: string[] = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string.');
    }
    if (typeof description !== 'string') {
      errors.push('Description must be a string.');
    }
    if (typeof price !== 'number' || isNaN(price) || price < 0) {
      errors.push('Price is required and must be a non-negative number.');
    }
    // Import FOODITEM_CATEGORY from the model
    if (!category ) {
      errors.push(`Category is required`);
    }
    if (typeof veg !== 'boolean') {
      errors.push('Veg must be a boolean.');
    }
    if (typeof available !== 'boolean') {
      errors.push('Available must be a boolean.');
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
    }

    const item = await FoodItem.create({ name, description, price, category, veg, available });
    console.log(item)
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to add food item' }, { status: 400 });
  }
}

// --- UPDATE a food item by id ---
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const { _id, ...update } = data;
    if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 });
    const item = await FoodItem.findByIdAndUpdate(_id, update, { new: true });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update food item' }, { status: 400 });
  }
}

// --- DELETE a food item by id (expects id in query string) ---
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const item = await FoodItem.findByIdAndDelete(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete food item' }, { status: 400 });
  }
}
