import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get user's subscriptions feed
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get user's subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { subscriberId: userId },
      select: { subscribedToId: true },
    })

    const subscribedToIds = subscriptions.map((s) => s.subscribedToId)

    if (subscribedToIds.length === 0) {
      return NextResponse.json({
        videos: [],
        total: 0,
        page,
        limit,
      })
    }

    // Get videos from subscribed creators
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: {
          userId: { in: subscribedToIds },
          status: 'APPROVED',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
              icon: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.video.count({
        where: {
          userId: { in: subscribedToIds },
          status: 'APPROVED',
        },
      }),
    ])

    return NextResponse.json({
      videos,
      total,
      page,
      limit,
      hasMore: skip + videos.length < total,
    })
  } catch (error) {
    console.error('Error fetching subscriptions feed:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
