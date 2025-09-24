import { NextRequest, NextResponse } from 'next/server'
import { ServerUserService } from './server-database'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number
    email: string
    name: string
    role: "user" | "admin"
    is_active: boolean
  }
}

export async function requireAuth(request: NextRequest): Promise<{ user: any; error?: NextResponse }> {
  try {
    // Get the session token from cookies or headers
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return { 
        user: null, 
        error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) 
      }
    }

    // In a real app, you'd verify the JWT token here
    // For now, we'll decode it as base64 (simple implementation)
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      const user = await ServerUserService.findById(decoded.userId)
      
      if (!user || !user.is_active) {
        return { 
          user: null, 
          error: NextResponse.json({ error: 'Invalid or inactive user' }, { status: 401 }) 
        }
      }

      return { user, error: undefined }
    } catch {
      return { 
        user: null, 
        error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) 
      }
    }
  } catch (error) {
    return { 
      user: null, 
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 500 }) 
    }
  }
}

export async function requireAdmin(request: NextRequest): Promise<{ user: any; error?: NextResponse }> {
  const { user, error } = await requireAuth(request)
  
  if (error) {
    return { user: null, error }
  }

  if (!user || user.role !== 'admin') {
    return { 
      user: null, 
      error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) 
    }
  }

  return { user, error: undefined }
}

export function createAuthToken(userId: number): string {
  // Simple base64 encoding - in production, use JWT
  return Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64')
}
