import { NextRequest, NextResponse } from 'next/server'
import { ServerUserService } from '@/lib/server-database'
import { createAuthToken } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await ServerUserService.validatePassword(email, password)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Create auth token
    const token = createAuthToken(user.id)

    // Set cookie
    const response = NextResponse.json({ 
      user,
      message: 'Sign in successful' 
    })
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Error signing in:', error)
    return NextResponse.json(
      { error: 'Sign in failed' },
      { status: 500 }
    )
  }
}