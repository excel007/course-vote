import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'
const COOKIE_NAME = 'admin_session'
const SECRET = process.env.ADMIN_PASSWORD || 'changeme'

function sign(value: string): string {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex')
}

export async function POST(request: Request) {
  const { password } = await request.json()

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = sign('admin-authenticated')
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
