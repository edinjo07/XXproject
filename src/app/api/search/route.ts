import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { searchSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || undefined
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.length < 2) {
      return NextResponse.json({
        videos: [],
        total: 0,
        page,
        limit,
      })
    }

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'APPROVED',
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    }

    if (category) {
      where.categoryId = category
    }

    // Determine sort order
    let orderBy: any
    switch (sortBy) {
      case 'recent':
        orderBy = { createdAt: 'desc' }
        break
      case 'popular':
      case 'views':
        orderBy = { views: 'desc' }
        break
      case 'relevance':
      default:
        // For relevance, prioritize title matches
        orderBy = { createdAt: 'desc' }
        break
    }

    // Execute search
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ])

    return NextResponse.json({
      videos,
      total,
      page,
      limit,
      hasMore: skip + videos.length < total,
    })
  } catch (error) {
    console.error('Error searching videos:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
