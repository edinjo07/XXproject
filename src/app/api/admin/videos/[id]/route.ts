import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const videoId = params.id
    const adminId = (session.user as any)?.id

    // Get video details before deletion
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        title: true,
        user: {
          select: { username: true }
        }
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Delete all related data first (views, earnings, reports)
    await prisma.$transaction([
      prisma.view.deleteMany({ where: { videoId } }),
      prisma.earning.deleteMany({ where: { videoId } }),
      prisma.report.deleteMany({ where: { videoId } }),
      prisma.video.delete({ where: { id: videoId } })
    ])

    // Log admin action
    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: 'VIDEO_DELETED',
        targetType: 'VIDEO',
        targetId: videoId,
        metadata: JSON.stringify({
          videoTitle: video.title,
          uploaderUsername: video.user.username
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
