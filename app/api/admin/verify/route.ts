import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const COOKIE_NAME = 'admin_session'
const SECRET = process.env.ADMIN_PASSWORD || 'changeme'

function sign(value: string): string {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex')
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token || token !== sign('admin-authenticated')) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
