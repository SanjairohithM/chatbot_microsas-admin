import { NextRequest, NextResponse } from 'next/server'
import { ServerUserService } from '@/lib/server-database'

export async function GET() {
  try {
    // Get all users with their related data
    const users = await ServerUserService.findAll()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

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

    const user = await ServerUserService.create(email, password, name, role as "user" | "admin")
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
