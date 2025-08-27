import { serverEnv } from 'data/env/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const input = searchParams.get('input')

  if (!input) {
    return NextResponse.json({ error: 'Missing input query' }, { status: 400 })
  }
console.log(serverEnv.GOOGLE_MAPS_API_KEY)
  const apiKey = serverEnv.GOOGLE_MAPS_API_KEY
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}&components=country:in`

  try {
    const response = await fetch(url)
    const data = await response.json()
    console.log(data)
    return NextResponse.json({data:{data},message:"Places fetched successfully"})
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 })
  }
}


