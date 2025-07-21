// lib/requireAuth.ts
import { NextResponse } from 'next/server'
import { verifyJwt } from './verifyJwt'

export async function requireAuth(req: Request, handler: Function) {
  const user = await verifyJwt(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pass user to your handler
  return handler(user)
}
