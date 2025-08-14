import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import WeeklyMenu from 'models/WeeklyMenu'

function getStartOfCurrentWeekMonday(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay() // 0 (Sun) - 6 (Sat)
  // We need Monday as start (1). If Sunday (0), go back 6 days; else go back day-1 days
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET() {
  try {
    await connectToDatabase()

    let menu = await WeeklyMenu.findOne({ active: true })
      .populate('monday')
      .populate('tuesday')
      .populate('wednesday')
      .populate('thursday')
      .populate('friday')
      .populate('saturday')

    if (!menu) {
      menu = await WeeklyMenu.create({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        weekStartDate: getStartOfCurrentWeekMonday(),
        active: true,
      })
      menu = await menu.populate([
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ])
    }

    return NextResponse.json({ data: menu })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch weekly menu' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      monday = [],
      tuesday = [],
      wednesday = [],
      thursday = [],
      friday = [],
      saturday = [],
    } = body || {}

    await connectToDatabase()

    let menu = await WeeklyMenu.findOne({ active: true })

    if (!menu) {
      menu = await WeeklyMenu.create({
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        weekStartDate: getStartOfCurrentWeekMonday(),
        active: true,
      })
    } else {
      menu.monday = monday
      menu.tuesday = tuesday
      menu.wednesday = wednesday
      menu.thursday = thursday
      menu.friday = friday
      menu.saturday = saturday
      await menu.save()
    }

    const populated = await WeeklyMenu.findById(menu._id)
      .populate('monday')
      .populate('tuesday')
      .populate('wednesday')
      .populate('thursday')
      .populate('friday')
      .populate('saturday')

    return NextResponse.json({ data: populated, message: 'Weekly menu saved' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to save weekly menu' }, { status: 400 })
  }
}
