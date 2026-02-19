import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/**
 * Security utilities for API route protection
 */

// Rate limiting store (in-memory for development, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Rate limiter configuration
 */
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per IP address
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    // Clean up expired entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }

    const current = rateLimitStore.get(ip)

    if (!current || current.resetAt < now) {
      // New window
      rateLimitStore.set(ip, {
        count: 1,
        resetAt: now + config.windowMs,
      })
      return null
    }

    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((current.resetAt - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetAt - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.resetAt.toString(),
          }
        }
      )
    }

    // Increment counter
    current.count++
    return null
  }
}

/**
 * Authentication middleware for API routes
 */
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      ),
      session: null,
    }
  }

  return { error: null, session }
}

/**
 * Admin authorization middleware
 */
export async function requireAdmin(request: NextRequest) {
  const { error, session } = await requireAuth(request)
  
  if (error) return { error, session: null }
  
  if (session?.user?.role !== 'ADMIN') {
    return {
      error: NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      ),
      session: null,
    }
  }

  return { error: null, session }
}

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Remove potentially dangerous characters from strings
   */
  string(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim()
      .substring(0, 1000) // Limit length
  },

  /**
   * Validate and sanitize email
   */
  email(input: string): string | null {
    const sanitized = input.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(sanitized) ? sanitized : null
  },

  /**
   * Validate and sanitize username
   */
  username(input: string): string | null {
    const sanitized = input.trim().toLowerCase()
    // Only allow alphanumeric, underscore, and hyphen
    const usernameRegex = /^[a-z0-9_-]{3,30}$/
    return usernameRegex.test(sanitized) ? sanitized : null
  },

  /**
   * Sanitize HTML to prevent XSS
   */
  html(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  },
}

/**
 * Validate file uploads
 */
export const validateUpload = {
  /**
   * Validate video file
   */
  video(file: File): { valid: boolean; error?: string } {
    const maxSize = 500 * 1024 * 1024 // 500MB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 500MB limit' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only MP4, WebM, OGG, and MOV are allowed' }
    }

    return { valid: true }
  },

  /**
   * Validate image file
   */
  image(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    if (file.size > maxSize) {
      return { valid: false, error: 'Image size exceeds 5MB limit' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' }
    }

    return { valid: true }
  },
}

/**
 * CSRF token validation (for forms)
 */
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Secure logging (sanitize sensitive data)
 */
export function secureLog(message: string, data?: any) {
  const sanitizedData = data ? JSON.parse(
    JSON.stringify(data, (key, value) => {
      // Hide sensitive fields
      if (['password', 'apiKey', 'secret', 'token', 'authorization'].includes(key.toLowerCase())) {
        return '[REDACTED]'
      }
      return value
    })
  ) : undefined

  console.log(`[SECURITY] ${message}`, sanitizedData || '')
}

/**
 * Check if request is from allowed origin
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  
  if (!origin) return true // Same-origin requests don't have origin header
  
  const allowedOrigins = [
    `https://${host}`,
    `http://${host}`,
    process.env.NEXT_PUBLIC_APP_URL || '',
  ].filter(Boolean)

  return allowedOrigins.some(allowed => origin.startsWith(allowed))
}
