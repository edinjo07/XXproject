import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id: videoId } = await params
    const adminId = (session.user as any)?.id

    const video = await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        moderatedById: adminId,
        moderatedAt: new Date(),
      },
      include: {
        user: {
          select: { username: true }
        }
      }
    })

    // Log admin action
    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: 'VIDEO_APPROVED',
        targetType: 'VIDEO',
        targetId: videoId,
        metadata: JSON.stringify({
          videoTitle: video.title,
          uploaderUsername: video.user.username
        })
      }
    })

    return NextResponse.json({ message: 'Video approved', video })
  } catch (error) {
    console.error('Error approving video:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
