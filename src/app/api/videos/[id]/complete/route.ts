import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { bunnyStream } from '@/lib/bunny-stream'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { id: videoId } = await params

    // Get video from database
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    if (video.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get video info from Bunny Stream
    const bunnyVideoInfo = await bunnyStream.getVideoInfo(video.bunnyVideoId)

    // Update video with duration and status
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        duration: bunnyVideoInfo.length || 0,
        status: bunnyVideoInfo.status === 4 ? 'PENDING' : video.status, // Status 4 = ready for processing
      },
    })

    return NextResponse.json({ video: updatedVideo })
  } catch (error) {
    console.error('Video completion error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
