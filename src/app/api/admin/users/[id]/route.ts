import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId } = await params

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 })
    }

    // Get all video IDs for this user
    const userVideos = await prisma.video.findMany({
      where: { userId },
      select: { id: true }
    })
    const videoIds = userVideos.map((v: { id: string }) => v.id)

    // Delete everything in a transaction
    await prisma.$transaction([
      // Delete views for user's videos
      prisma.view.deleteMany({ where: { videoId: { in: videoIds } } }),
      // Delete reports for user's videos
      prisma.report.deleteMany({ where: { videoId: { in: videoIds } } }),
      // Delete earnings for user's videos
      prisma.earning.deleteMany({ where: { videoId: { in: videoIds } } }),
      // Delete earnings for the user
      prisma.earning.deleteMany({ where: { userId } }),
      // Delete user's videos
      prisma.video.deleteMany({ where: { userId } }),
      // Delete reports made by user
      prisma.report.deleteMany({ where: { reporterId: userId } }),
      // Finally delete the user
      prisma.user.delete({ where: { id: userId } })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
