import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// In-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // requests per window
const RATE_LIMIT_API_STRICT = 30 // stricter limit for sensitive API routes

/**
 * Rate limiting middleware
 */
function checkRateLimit(request: NextRequest, maxRequests: number): NextResponse | null {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  
  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }

  const key = `${ip}:${request.nextUrl.pathname}`
  const current = rateLimitStore.get(key)

  if (!current || current.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    })
    return null
  }

  if (current.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((current.resetAt - now) / 1000).toString(),
        }
      }
    )
  }

  current.count++
  return null
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Rate limiting for API routes (stricter limits for sensitive endpoints)
  if (path.startsWith('/api/')) {
    const isSensitiveRoute = path.includes('/auth/') || 
                            path.includes('/admin/') || 
                            path.includes('/upload')
    
    const rateLimitResponse = checkRateLimit(
      request, 
      isSensitiveRoute ? RATE_LIMIT_API_STRICT : RATE_LIMIT_MAX_REQUESTS
    )
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }

  // Validate origin for API requests
  if (path.startsWith('/api/') && request.method !== 'GET') {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    if (origin && !origin.includes(host || '')) {
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      )
    }
  }

  // Check if the path is an admin route (except login)
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })

    // If no token or not an admin, redirect to admin login
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
