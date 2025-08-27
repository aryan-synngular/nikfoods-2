import { serverEnv } from "data/env/server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const placeId = searchParams.get("place_id")

  if (!placeId) {
    return NextResponse.json({ error: "Missing place_id" }, { status: 400 })
  }

  const apiKey = serverEnv.GOOGLE_MAPS_API_KEY
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!data.result) {
      return NextResponse.json({ error: "No details found" }, { status: 404 })
    }

    const components = data.result.address_components
    const get = (type: string) =>
      components.find((c: any) => c.types.includes(type))?.long_name || ""

    const formatted = {
      street: `${get("street_number")} ${get("route")}`.trim(),
      town: get("sublocality") || get("sublocality_level_1"),
      city: get("locality"),
      state: get("administrative_area_level_1"),
      country: get("country"),
      pincode: get("postal_code"),
      lat: data.result.geometry?.location.lat,
      lng: data.result.geometry?.location.lng,
      full_address: data.result.formatted_address,
    }

    return NextResponse.json({
      data: formatted,
      message: "Place details fetched successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch place details" }, { status: 500 })
  }
}
