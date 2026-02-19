import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reason } = await req.json()
    const userId = params.id
    const adminId = (session.user as any)?.id

    // Check if user exists and is not admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, username: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot ban admin users' }, { status: 403 })
    }

    // Ban user
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'BANNED',
        suspendedAt: new Date(),
        suspendedReason: reason || 'Severe policy violation',
        suspendedBy: adminId
      }
    })

    // Log the action
    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: 'USER_BANNED',
        targetType: 'USER',
        targetId: userId,
        reason: reason || 'Severe policy violation',
        metadata: JSON.stringify({ username: user.username })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error banning user:', error)
    return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 })
  }
}
