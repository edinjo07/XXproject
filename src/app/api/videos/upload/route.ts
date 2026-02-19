import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { bunnyStream } from '@/lib/bunny-stream'
import { z } from 'zod'

const uploadSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  categoryId: z.string().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    // Only creators can upload videos
    if (userRole !== 'CREATOR' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only creators can upload videos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, categoryId } = uploadSchema.parse(body)

    // Create video in Bunny Stream
    const bunnyVideo = await bunnyStream.createVideo(title)

    // Create video record in database
    const video = await prisma.video.create({
      data: {
        title,
        description,
        categoryId: categoryId || null,
        bunnyVideoId: bunnyVideo.guid,
        bunnyLibraryId: bunnyStream['libraryId'],
        thumbnail: bunnyStream.getThumbnailUrl(bunnyVideo.guid),
        duration: 0, // Will be updated after encoding
        userId,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      video: {
        id: video.id,
        title: video.title,
        bunnyVideoId: video.bunnyVideoId,
      },
      uploadUrl: bunnyStream.getUploadUrl(bunnyVideo.guid),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Upload initialization error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
