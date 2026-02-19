import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalUsers, totalVideos, pendingVideos, viewsData, earningsData] = await Promise.all([
      prisma.user.count(),
      prisma.video.count(),
      prisma.video.count({ where: { status: 'PENDING' } }),
      prisma.video.aggregate({ _sum: { views: true } }),
      prisma.earning.aggregate({ _sum: { amount: true } })
    ])

    return NextResponse.json({
      totalUsers,
      totalVideos,
      pendingVideos,
      totalViews: viewsData._sum.views || 0,
      totalEarnings: Number(earningsData._sum.amount) || 0
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
