import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validation'
import { sanitize, secureLog, validateOrigin } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Validate origin
    if (!validateOrigin(request)) {
      secureLog('Invalid origin attempt on registration')
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validation.error.errors.map(e => e.message) 
        },
        { status: 400 }
      )
    }

    const { email, username, password } = validation.data

    // Sanitize inputs
    const sanitizedEmail = sanitize.email(email)
    const sanitizedUsername = sanitize.username(username)

    if (!sanitizedEmail || !sanitizedUsername) {
      return NextResponse.json(
        { error: 'Invalid email or username format' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: sanitizedEmail },
          { username: sanitizedUsername },
        ],
      },
    })

    if (existingUser) {
      secureLog('Registration attempt with existing credentials', { 
        email: sanitizedEmail 
      })
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password with high cost factor
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        username: sanitizedUsername,
        password: hashedPassword,
        role: 'USER', // Default role, creators must be upgraded
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    })

    secureLog('User registered successfully', { 
      userId: user.id, 
      email: user.email 
    })

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user 
      },
      { status: 201 }
    )
  } catch (error) {
    secureLog('Registration error', error)
    return NextResponse.json(
      { error: 'Something went wrong during registration' },
      { status: 500 }
    )
  }
}
