// apps/next/pages/api/hello.ts
import { connectToDatabase } from 'lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
try {
  await connectToDatabase()
    return NextResponse.json({healthCheck:"success"})
  
} catch (error) {
  return NextResponse.json({healthCheck:"error"})
}
}
