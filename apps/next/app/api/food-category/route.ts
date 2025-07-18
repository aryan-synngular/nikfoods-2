import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from 'lib/db';
import FoodCategory from 'models/FoodCategory';

// --- GET all categories ---
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);

    const filter: any = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const totalCategories = await FoodCategory.countDocuments(filter);

    const categories = await FoodCategory.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      items: categories,
      total: totalCategories,
      page,
      pageSize: limit,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// --- ADD a new category ---
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const { name, description } = data;
    const errors: string[] = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string.');
    }
    if (description && typeof description !== 'string') {
      errors.push('Description must be a string.');
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
    }

    const category = await FoodCategory.create({ name, description });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 400 });
  }
}

// --- UPDATE a category by id ---
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const { _id, ...update } = data;

    if (!_id) {
      return NextResponse.json({ error: 'Missing _id' }, { status: 400 });
    }

    const category = await FoodCategory.findByIdAndUpdate(_id, update, { new: true });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 400 });
  }
}

// --- DELETE a category by id ---
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const category = await FoodCategory.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 400 });
  }
}
