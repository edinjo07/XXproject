import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id
    const ipAddress = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Get session (optional)
    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : null

    // Check if video exists and is approved
    const video = await prisma.video.findUnique({
      where: { id: videoId, status: 'APPROVED' },
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found or not approved' },
        { status: 404 }
      )
    }

    // Check for duplicate views from same IP within time window
    const duplicateWindow = new Date()
    duplicateWindow.setMinutes(
      duplicateWindow.getMinutes() - config.viewTracking.duplicateWindowMinutes
    )

    const existingView = await prisma.view.findFirst({
      where: {
        videoId,
        ipAddress,
        createdAt: {
          gte: duplicateWindow,
        },
      },
    })

    if (existingView) {
      return NextResponse.json({ message: 'View already counted' })
    }

    // Create view record
    await prisma.$transaction([
      prisma.view.create({
        data: {
          videoId,
          userId,
          ipAddress,
          userAgent,
        },
      }),
      prisma.video.update({
        where: { id: videoId },
        data: {
          views: {
            increment: 1,
          },
        },
      }),
    ])

    return NextResponse.json({ message: 'View recorded' })
  } catch (error) {
    console.error('View tracking error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
