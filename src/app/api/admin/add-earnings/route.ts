import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, amount } = await req.json()

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create a bonus earning entry (no video associated)
    await prisma.earning.create({
      data: {
        userId,
        videoId: null,
        amount: parseFloat(amount),
        views: 0,
        status: 'CONFIRMED'
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        amount: parseFloat(amount)
      }
    })
  } catch (error) {
    console.error('Error adding earnings:', error)
    return NextResponse.json({ error: 'Failed to add earnings' }, { status: 500 })
  }
}
