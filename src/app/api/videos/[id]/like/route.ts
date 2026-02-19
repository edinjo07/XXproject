import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { id: videoId } = await params

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId, status: 'APPROVED' },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked this video' },
        { status: 400 }
      )
    }

    // Create like
    await prisma.like.create({
      data: {
        videoId,
        userId,
      },
    })

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { videoId },
    })

    return NextResponse.json({
      success: true,
      likeCount,
    })
  } catch (error) {
    console.error('Error liking video:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { id: videoId } = await params

    // Delete like
    await prisma.like.deleteMany({
      where: {
        videoId,
        userId,
      },
    })

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { videoId },
    })

    return NextResponse.json({
      success: true,
      likeCount,
    })
  } catch (error) {
    console.error('Error unliking video:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params
    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : null

    // Get like count
    const likeCount = await prisma.like.count({
      where: { videoId },
    })

    // Check if current user has liked (if logged in)
    let isLiked = false
    if (userId) {
      const userLike = await prisma.like.findUnique({
        where: {
          videoId_userId: {
            videoId,
            userId,
          },
        },
      })
      isLiked = !!userLike
    }

    return NextResponse.json({
      likeCount,
      isLiked,
    })
  } catch (error) {
    console.error('Error getting likes:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
