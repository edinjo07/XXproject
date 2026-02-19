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

    const { userId, viewCount } = await req.json()

    if (!userId || !viewCount || viewCount < 1) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Get the user's most recent approved video
    const video = await prisma.video.findFirst({
      where: {
        userId,
        status: 'APPROVED'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'No approved videos found for this user' }, { status: 404 })
    }

    // Generate unique IP addresses for views
    const views = []
    for (let i = 0; i < viewCount; i++) {
      views.push({
        videoId: video.id,
        userId: null,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        createdAt: new Date()
      })
    }

    // Create views in batches to avoid overwhelming the database
    const batchSize = 100
    for (let i = 0; i < views.length; i += batchSize) {
      const batch = views.slice(i, i + batchSize)
      await prisma.view.createMany({
        data: batch
      })
    }

    // Update video view count
    await prisma.video.update({
      where: { id: video.id },
      data: {
        views: {
          increment: viewCount
        }
      }
    })

    // Calculate earnings ($5 per 1000 views)
    const earningsAmount = (viewCount / 1000) * 5
    
    await prisma.earning.create({
      data: {
        userId,
        videoId: video.id,
        amount: earningsAmount,
        views: viewCount,
        status: 'CONFIRMED'
      }
    })

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        newViews: viewCount,
        earnings: earningsAmount
      }
    })
  } catch (error) {
    console.error('Error simulating views:', error)
    return NextResponse.json({ error: 'Failed to simulate views' }, { status: 500 })
  }
}
