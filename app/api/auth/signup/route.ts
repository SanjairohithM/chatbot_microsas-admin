import { NextRequest, NextResponse } from 'next/server'
import { ServerUserService } from '@/lib/server-database'
import { createAuthToken } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = "user" } = await request.json()
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (role && !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either "user" or "admin"' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await ServerUserService.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    const user = await ServerUserService.create(email, password, name, role as "user" | "admin")

    // Create auth token
    const token = createAuthToken(user.id)

    // Set cookie
    const response = NextResponse.json({ 
      user,
      message: 'Sign up successful' 
    })
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Error signing up:', error)
    return NextResponse.json(
      { error: 'Sign up failed' },
      { status: 500 }
    )
  }
}